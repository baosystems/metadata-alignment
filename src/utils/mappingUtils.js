export function flattenDataSets(dSets) {
  const des = []
  for (const { dataSetElements } of dSets) {
    des.push(...dataSetElements.map((dse) => dse.dataElement))
  }
  return des
}

function getDeCoMap(deIds, dSets) {
  if (deIds === undefined) {
    return []
  }
  const result = []
  for (const ds of dSets) {
    for (const { dataElement } of ds.dataSetElements) {
      const deId = dataElement.id
      if (deIds.includes(deId)) {
        const cocs = dataElement?.categoryCombo?.categoryOptionCombos
        if (cocs) {
          result.push(...cocs)
        }
      }
    }
  }
  return result
}

export function getCos(sourceDeIds, targetDeIds, dsConfig) {
  const { sourceDSets, targetDSets } = dsConfig
  return {
    sourceCos: getDeCoMap(sourceDeIds, sourceDSets),
    targetCos: getDeCoMap(targetDeIds, targetDSets),
  }
}
