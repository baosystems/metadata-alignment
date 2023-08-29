import {
  dataStoreKey,
  dsLocations,
} from '../components/SetupPage/SetupPageConsts'
import {
  dsInfoFields,
  dsInfoQuery,
} from '../components/SetupPage/SetupPageQueries'
import { metaTypes } from '../mappingContext'

const successCodes = [200, 201, 204]

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
  return noHttp.replaceAll('.', '-').replaceAll('/', '_')
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

export class PatRequestError extends Error {
  constructor(message) {
    super(message)
  }
}

export const formatUrl = (url) => {
  return url.replace('https://', '').replace('http://', '')
}

async function getPat(engine, baseUrl) {
  const urlKey = urlToKey(baseUrl)
  const patRes = await engine.query({
    pat: {
      resource: `userDataStore/${dataStoreKey}/${urlKey}`,
    },
  })
  return patRes?.pat?.pat
}

async function getExternalDs(dsIds, engine, baseUrl, patIn = null) {
  const urlKey = urlToKey(baseUrl)
  let pat = ''
  try {
    pat = patIn || (await getPat(engine, baseUrl))
  } catch (error) {
    throw new PatRequestError(
      'Could not find personal access token for ' + urlKey
    )
  }
  const params = {
    filter: `id:in:[${dsIds.join(',')}]`,
    fields: dsInfoFields,
  }
  let req = {}
  try {
    req = await fetch(`${baseUrl}/api/dataSets?${formatParams(params)}`, {
      method: 'GET',
      headers: {
        Authorization: `ApiToken ${pat}`,
      },
    })

    if (successCodes.includes(req.status)) {
      const res = await req.json()
      return res.dataSets
    } else if (req.status === 401) {
      throw new PatRequestError(
        'Could not find personal access token for ' + urlKey
      )
    }
  } catch (err) {
    throw new Error('Error fetching data set information ' + err)
  }
}

export async function requestDsData(
  engine,
  dsIds,
  { dsLocation, baseUrl },
  pat = null
) {
  if (dsLocation === dsLocations.currentServer) {
    const res = await engine.query(dsInfoQuery, { variables: { dsIds } })
    return res.dataSets.dataSets
  } else {
    return getExternalDs(dsIds, engine, baseUrl, pat)
  }
}

const pipelineDetails = {
  [metaTypes.DE_COC]: {
    nameSuffix: 'DE CoC',
    descPrefix: 'Data Element and Category Option Combo',
  },
  [metaTypes.AOC]: {
    nameSuffix: 'AOC',
    descPrefix: 'Attribute Option Combo',
  },
  [metaTypes.OU]: {
    nameSuffix: 'OU',
    descPrefix: 'Organisation Unit',
  },
}

/**
 * The AP CSV pipelines uses the file name to generate the table name. Because the table
 * name has a max length of 70 characters, the uploaded file name cannot be longer than 70
 * @param {String} srcDsName Source data set names
 * @param {String} tgtDsName Target data set names
 * @param {String} suffix Mapping type, eg OU, AOC or DE COC
 * @returns String name with these three fields
 */
function trimName(srcDsName, tgtDsName, suffix) {
  const maxNameLength = 70
  const suffixText = ` (${suffix})`
  const limit = maxNameLength - suffixText.length
  const halfLimit = Math.floor(limit / 2)
  const srcExtra = Math.max(0, halfLimit - tgtDsName.length)
  const tgtExtra = Math.max(0, halfLimit - srcDsName.length)
  return `${srcDsName.slice(0, halfLimit + srcExtra)}-${tgtDsName.slice(
    0,
    halfLimit + tgtExtra
  )}${suffixText}`
}

export const getPipelineNameAndDesc = (mapConfig, mappingType) => {
  const { sourceDs, targetDs } = mapConfig
  const { nameSuffix, descPrefix } = pipelineDetails[mappingType]
  const name = trimName(sourceDs?.[0]?.name, targetDs?.[0]?.name, nameSuffix)
  const description = `${descPrefix} Mapping Between
     ${sourceDs?.[0]?.name} and ${targetDs?.[0]?.name} Data Sets`
  return { name, description }
}

async function getMappingPipeline(existingPipelineId, headers) {
  return await (
    await fetch(AP_BASE_URL + AP_CSV_UPLOAD_PATH + '/' + existingPipelineId, {
      headers: headers,
      method: 'GET',
    })
  ).json()
}

function getFormData(name, description, file) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('description', description)
  formData.append('file', file)
  return formData
}

export const createPipeline = async (
  file,
  name,
  description,
  existingPipelineId
) => {
  const auth = sessionStorage.getItem('auth')
  if (!auth) {
    throw Error('Please sign in to AP.')
  }

  const headers = new Headers()
  headers.set('Authorization', `Basic ${auth}`)

  const formData = getFormData(name, description, file)

  if (existingPipelineId) {
    const pipeline = await getMappingPipeline(existingPipelineId, headers)
    if (pipeline.id !== existingPipelineId) {
      existingPipelineId = null
    }
  }

  const uploadPath = existingPipelineId
    ? `/${existingPipelineId}/fileUpload`
    : '/fileUpload'

  const pipelineCreateResponse = await (
    await fetch(AP_BASE_URL + AP_CSV_UPLOAD_PATH + uploadPath, {
      headers: headers,
      method: 'POST',
      body: formData,
    })
  ).json()

  if (!successCodes.includes(pipelineCreateResponse.statusCode)) {
    throw pipelineCreateResponse
  }

  return pipelineCreateResponse?.data?.id
}

export const loginToAP = (username, password) => {
  const headers = new Headers()
  const auth = window.btoa(`${username}:${password}`)
  headers.set('Authorization', 'Basic ' + auth)

  return fetch(AP_BASE_URL + AP_AUTH_PATH, {
    headers: headers,
    method: 'GET',
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      sessionStorage.setItem('auth', auth)
      sessionStorage.setItem('username', username)
      return data
    })
    .catch((error) => {
      throw error
    })
}

const AP_BASE_URL =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? 'https://test.manager.baosystems.com'
    : 'https://manager.baosystems.com'

const AP_AUTH_PATH = '/api/manager/info'
const AP_CSV_UPLOAD_PATH = '/api/dataPipelines/csvUpload'
