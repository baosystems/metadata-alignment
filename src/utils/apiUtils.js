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

const makeMutation = (type, urlKey, pat) => ({
  type,
  resource: `userDataStore/${dataStoreKey}/${urlKey}?encrypt=true`,
  data: { pat },
})

export async function savePat(engine, targetUrl, pat) {
  const urlKey = targetUrl.replace('https://', '').replace('http://', '')
  try {
    const { namespaces } = await engine.query(udsQuery)
    if (namespaces.includes(dataStoreKey)) {
      const updateDs = await engine.mutate(makeMutation('update', urlKey, pat))
      console.log(`Updated user data store (${updateDs.httpStatusCode})`)
    } else {
      const updateDs = await engine.mutate(makeMutation('create', urlKey, pat))
      console.log(`Added to user data store (${updateDs.httpStatusCode})`)
    }
  } catch (e) {
    console.log('Error saving personal access token: ', e)
  }
}

async function getExternalDs(dsIds, engine, baseUrl) {
  const urlKey = baseUrl.replace('https://', '').replace('http://', '')
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
