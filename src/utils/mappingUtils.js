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
  const { rankedTgtOpts, matchThreshold, sourceItems } = config
  const bestMatch = rankedTgtOpts[0]
  if (matchThreshold === 0.0) {
    const hasSource = sourceItems.length > 0
    if (hasSource && bestMatch.name === sourceItems[0].name) {
      return [bestMatch.id]
    } else {
      return []
    }
  }
  if (bestMatch.score < matchThreshold) {
    return [bestMatch.id]
  } else {
    return []
  }
}

export function getUniqueOpts(optArray) {
  const uidSet = new Set()
  return optArray.filter(({ id }) => {
    if (!uidSet.has(id)) {
      uidSet.add(id)
      return true
    }
  })
}
