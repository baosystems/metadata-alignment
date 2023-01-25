import { dataStoreKey } from '../components/SetupPage/SetupPageConsts'
import { mappingsKey } from '../components/MappingPage/MappingConsts'

export const dsQuery = {
  namespaces: {
    resource: `dataStore`,
  },
}

export const keysQuery = {
  nameSpaceKeys: {
    resource: `dataStore/${dataStoreKey}`,
  },
}

export const mappingsQuery = {
  mappings: {
    resource: `dataStore/${dataStoreKey}/${mappingsKey}`,
  },
}

export const mappingsMutation = (type, maps) => ({
  type,
  resource: `dataStore/${dataStoreKey}/${mappingsKey}`,
  data: maps,
})

async function checkForKey(engine, dsType, keyInfo) {
  const { namespace, key } = keyInfo
  const dsQuery = { namespaces: { resource: dsType } }
  const { namespaces } = await engine.query(dsQuery)
  if (namespaces.includes(namespace)) {
    const keysQuery = { nsKeys: { resource: `${dsType}/${namespace}` } }
    const { nsKeys } = await engine.query(keysQuery)
    return nsKeys.includes(key)
  } else {
    return false
  }
}

export async function getFromDataStore(engine, dsType, keyInfo) {
  const keyExists = await checkForKey(engine, dsType, keyInfo)
  const { namespace, key } = keyInfo
  if (keyExists) {
    const dataQuery = { data: { resource: `${dsType}/${namespace}/${key}` } }
    const { data } = await engine.query(dataQuery)
    return data
  }
}

export function getRowKey(rowData) {
  const { sourceDs, targetDs, sourceUrl, targetUrl } = rowData
  const sourceAddress = sourceUrl.replace(/^http*s:\/\//, '')
  const targetAddress = targetUrl.replace(/^http*s:\/\//, '')
  const srcDsIds = sourceDs.map((ds) => ds.id).join('-')
  const tgtDsIds = targetDs.map((ds) => ds.id).join('-')
  return `${srcDsIds}-${tgtDsIds}-${sourceAddress}-${targetAddress}`
}

export const saveMapping = async (engine, config, state, pipelines) => {
  if (!pipelines) {
    pipelines = {}
  }

  const rowKey = getRowKey(config)
  const nextMap = getNextMap(config, state, rowKey)
  nextMap.mappingPipelines = pipelines

  const existingMaps = await getMaps(engine)
  const otherMaps = existingMaps.filter((mapp) => mapp.rowKey !== rowKey)

  await engine.mutate(mappingsMutation('update', [nextMap, ...otherMaps]))
}

const getMaps = async (engine) => {
  const { namespaces } = await engine.query(dsQuery)
  let nameSpaceKeys = []
  if (namespaces.includes(dataStoreKey)) {
    const res = await engine.query(keysQuery)
    nameSpaceKeys = res.nameSpaceKeys
  }
  if (!nameSpaceKeys.includes(mappingsKey)) {
    await engine.mutate(mappingsMutation('create', []))
    return []
  } else {
    const { mappings } = await engine.query(mappingsQuery)
    return mappings
  }
}

function getNextMap(mapConfig, mappingState, rowKey) {
  const { sourceDs, targetDs, sourceUrl, targetUrl } = mapConfig
  const { deCocMappings, aocMappings, ouMappings } = mappingState

  return {
    rowKey,
    sourceDs,
    targetDs,
    sourceUrl,
    targetUrl,
    deCocMappings,
    aocMappings,
    ouMappings,
  }
}
