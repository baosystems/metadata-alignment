export function flattenDataSets(dSets) {
  const des = []
  for (const { dataSetElements } of dSets) {
    des.push(...dataSetElements.map((dse) => dse.dataElement))
  }
  return des
}

export function getCocs(deIds, deCocMap) {
  const cocs = []
  for (const deId of deIds) {
    cocs.push(...deCocMap[deId])
  }
  return cocs
}

export function getSourceNames(opts, ids) {
  const names = []
  for (const opt of opts) {
    if (ids.includes(opt.id)) {
      names.push(opt.name)
    }
  }
  if (names.length === 0) {
    const idsStr = ids.join(', ')
    const optsStr = JSON.stringify(opts)
    throw `No options with ids ${idsStr} in available options: ${optsStr}`
  } else {
    return names
  }
}

export function autoFill(config) {
  const { rankedTgtOpts, matchThreshold, sourceItems, setMapping } = config
  console.log('Initial mapping...')
  const bestMatch = rankedTgtOpts[0]
  if (matchThreshold === 0.0) {
    console.log('Perfect matches only')
    const hasSource = sourceItems.length > 0
    if (hasSource && bestMatch.name === sourceItems[0].name) {
      setMapping([bestMatch.id])
    } else {
      console.log(
        `'${bestMatch.name}' does not perfectly match '${sourceItems[0].name}'`
      )
      setMapping([])
    }
  }
  if (bestMatch.score < matchThreshold) {
    setMapping([bestMatch.id])
  } else {
    setMapping([])
  }
}
