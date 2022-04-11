import {
  dataStoreKey,
  dsLocations,
} from '../components/SetupPage/SetupPageConsts'
import { dsInfoQuery } from '../components/SetupPage/SetupPageQueries'

/* Process a key: value params object and return a params url string
 * @param params {object}: An object with keys and strings or string arrays to format
 * @returns {String}: A string with the keys and values formatted for an api request
 */
export function formatParams(params) {
  const paramsArr = []
  for (const key in params) {
    if (Array.isArray(params[key])) {
      for (const value of params[key]) {
        paramsArr.push(`${key}=${value}`)
      }
    } else {
      paramsArr.push(`${key}=${params[key]}`)
    }
  }
  return paramsArr.join('&')
}

const udsQuery = {
  namespaces: {
    resource: `userDataStore`,
  },
}

const keysQuery = {
  nameSpaceKeys: {
    resource: `userDataStore/${dataStoreKey}`,
  },
}

const urlToKey = (url) => {
  const noHttp = url.replace('https://', '').replace('http://', '')
  return noHttp.replaceAll('.', '-')
}

const makeMutation = (type, urlKey, pat) => ({
  type,
  resource: `userDataStore/${dataStoreKey}/${urlKey}?encrypt=true`,
  data: { pat },
})

const saveToDs = async (engine, type, dataStoreInfo) => {
  const { urlKey, pat } = dataStoreInfo
  const dsChange = await engine.mutate(makeMutation(type, urlKey, pat))
  console.log(`PAT saved in the data store (${dsChange.httpStatusCode})`)
}

export async function savePat(engine, targetUrl, pat) {
  const urlKey = urlToKey(targetUrl)
  const dataStoreInfo = { urlKey, pat }
  try {
    const { namespaces } = await engine.query(udsQuery)
    if (namespaces.includes(dataStoreKey)) {
      const { nameSpaceKeys } = await engine.query(keysQuery)
      if (nameSpaceKeys.includes(urlKey)) {
        saveToDs(engine, 'update', dataStoreInfo)
      } else {
        saveToDs(engine, 'create', dataStoreInfo)
      }
    } else {
      saveToDs(engine, 'create', dataStoreInfo)
    }
  } catch (e) {
    console.log('Error saving personal access token: ', e)
  }
}

async function getExternalDs(dsIds, engine, baseUrl) {
  const urlKey = urlToKey(baseUrl)
  const patRes = await engine.query({
    pat: {
      resource: `userDataStore/${dataStoreKey}/${urlKey}`,
    },
  })
  const pat = patRes.pat.pat
  const params = {
    filter: `id:in:[${dsIds.join(',')}]`,
    fields:
      'id,name,dataSetElements(dataElement(id,name,categoryCombo(categoryOptionCombos(id,name))))',
  }
  const req = await fetch(`${baseUrl}/api/dataSets?${formatParams(params)}`, {
    method: 'GET',
    headers: {
      Authorization: `ApiToken ${pat}`,
    },
  })
  const res = await req.json()
  return res.dataSets
}

export async function getDsData(engine, dsIds, { dsLocation, baseUrl }) {
  if (dsLocation === dsLocations.currentServer) {
    const res = await engine.query(dsInfoQuery, { variables: { dsIds } })
    return res.dataSets.dataSets
  } else {
    return getExternalDs(dsIds, engine, baseUrl)
  }
}
