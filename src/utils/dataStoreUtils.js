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
  const srcDsIds = sourceDs.map((ds) => ds.id).join('-')
  const tgtDsIds = targetDs.map((ds) => ds.id).join('-')
  return `${srcDsIds}-${tgtDsIds}-${sourceUrl}-${targetUrl}`
}
