import { isEqual } from 'lodash'
import { mappingDestinations } from '../components/MappingPage/MappingConsts'

export function flattenDataSetElements(dSets) {
  const des = []
  for (const { dataSetElements } of dSets) {
    des.push(...dataSetElements.map((dse) => dse.dataElement))
  }
  return des
}

export function flattenAocs(dSets) {
  const aocs = []

  for (const { categoryCombo } of dSets) {
    aocs.push(...categoryCombo.categoryOptionCombos)
  }

  return aocs
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
  if (rankedTgtOpts.length === 0) {
    return []
  }
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

export function getMapInfo(dSets) {
  const result = { ids: [], names: [] }
  for (const ds of dSets) {
    result.ids.push(ds.id)
    result.names.push(ds.name)
  }
  return result
}

// For a given data set, get all the unique cocs assigned across all the
// data elements in the data set
function getDsDeCocs(ds) {
  const cocsByUid = new Set()
  for (const { dataElement } of ds.dataSetElements) {
    const deCocs = dataElement?.categoryCombo?.categoryOptionCombos || []
    for (const coc of deCocs) {
      cocsByUid.add(coc.id)
    }
  }
  return Array.from(cocsByUid)
}

/**
 * Compare a single new and old data set and return the removed items by type
 * @param {Object} dsOld Original data set
 * @param {Object} dsNew New data set
 * @returns {Object} Object holding the metadata removed between old and new
 */
function getRemovedDsMetadata(dsOld, dsNew) {
  const oldAocs = dsOld.categoryCombo.categoryOptionCombos
  const oldAocUids = oldAocs.map(({ id }) => id)
  const newAocs = dsNew?.categoryCombo?.categoryOptionCombos
  const newAocUids = (newAocs || []).map(({ id }) => id)
  const oldDeUids = dsOld.dataSetElements.map((dse) => dse.dataElement.id)
  const newDses = dsNew?.dataSetElements
  const newDeUids = (newDses || []).map((dse) => dse.dataElement.id)
  const oldCocUids = getDsDeCocs(dsOld)
  const newCocUids = getDsDeCocs(dsNew)
  const result = {
    aocs: oldAocUids.filter((aocId) => !newAocUids.includes(aocId)),
    des: oldDeUids.filter((deId) => !newDeUids.includes(deId)),
    cocs: oldCocUids.filter((cocId) => !newCocUids.includes(cocId)),
  }
  if (Object.values(result).some((val) => val && val.length > 0)) {
    return result
  } else {
    // If there are no values to remove, make this
    // easy for the consuming function to tell
    return null
  }
}

/**
 * Compare all the new and old data sets and return the removed items by type
 * @param {Array} oldDataSets Array of old data set metadata
 * @param {Array} newDataSets Array of new data set metadata
 * @returns {Object} Object with the removed metadata by types
 */
function getRemovedMetadata(oldDataSets, newDataSets) {
  const result = {
    aocs: [],
    des: [],
    cocs: [],
  }
  for (const oldDs of oldDataSets) {
    const newDs = newDataSets.find((newDs) => newDs.id === oldDs.id)
    const dsResult = getRemovedDsMetadata(oldDs, newDs || {})
    if (dsResult) {
      result.aocs = [...result.aocs, ...dsResult.aocs]
      result.des = [...result.des, ...dsResult.des]
      result.cocs = [...result.cocs, ...dsResult.cocs]
    }
  }
  if (Object.values(result).some((val) => val && val.length > 0)) {
    return {
      aocs: Array.from(new Set(result.aocs)),
      des: Array.from(new Set(result.des)),
      cocs: Array.from(new Set(result.cocs)),
    }
  } else {
    // If there are no values to remove, make this
    // easy for the consuming function to tell
    return null
  }
}

function removeIfIn(arr, itemsToRemove) {
  return arr.filter((arrItem) => !itemsToRemove.includes(arrItem))
}

/**
 * Update a de mapping by removing the data elements and cocs specified
 * If there is no longer a source data element, then the mapping row should no
 * longer exist, so null is returned
 * @param {Object} deMap Mapping row for data elements
 * @param {Object} config Holds which fields should be removed and what the destination is
 * @returns An updated de mapping row if the row is still valid, otherwise nullish
 */
function removeDesCocs(deMap, config) {
  const { removedMetadata, mappingDestination } = config
  const removeCocs = removedMetadata?.cocs || []
  const removeDes = removedMetadata?.des || []
  const deKey = `${mappingDestination}Des`
  const cocKey = `${mappingDestination}Cocs`
  const result = {
    ...deMap,
    [deKey]: removeIfIn(deMap[deKey], removeDes),
    cocMappings: deMap.cocMappings.map((cocMapping) => ({
      ...cocMapping,
      [cocKey]: removeIfIn(cocMapping[cocKey], removeCocs),
    })),
  }
  // If there are no source des left, then this mapping row should be removed
  return result.sourceDes.length > 0 ? result : null
}

/**
 * Update an aoc mapping by removing the aocs specified. If there is no longer
 * a source aoc left then return null as the row is no longer valid
 * @param {Object} aocMap Mapping row for aocs
 * @param {Object} config Holds which fields should be removed and what the destination is
 * @returns An updated aoc mapping row if the row is still valid, otherwise null
 */
function removeAocs(aocMap, config) {
  const { removedMetadata, mappingDestination } = config
  const removeAocs = removedMetadata?.aocs || []
  const aocKey = `${mappingDestination}Aocs`
  const result = {
    ...aocMap,
    [aocKey]: removeIfIn(aocMap[aocKey], removeAocs),
  }
  // If there are no source aocs left, then this mapping row should be removed
  return result.sourceAocs.length > 0 ? result : null
}

function getNewMetadata(oldDataSets, newDataSets) {
  const result = { des: [], aocs: [] }
  for (const newDs of newDataSets) {
    const oldDs = oldDataSets.find((oldDs) => newDs.id === oldDs.id)
    const oldAocs = oldDs.categoryCombo.categoryOptionCombos
    const oldDsAocUids = oldAocs.map(({ id }) => id)
    const newAocs = newDs?.categoryCombo?.categoryOptionCombos
    const newDsAocUids = (newAocs || []).map(({ id }) => id)
    const oldDsDeUids = oldDs.dataSetElements.map((dse) => dse.dataElement.id)
    const newDses = newDs?.dataSetElements
    const newDsDeUids = (newDses || []).map((dse) => dse.dataElement.id)
    const newDeUids = newDsDeUids.filter(
      (deUid) => !oldDsDeUids.includes(deUid)
    )
    const newDeRows = newDeUids.map((deUid) => ({
      sourceDes: [deUid],
      targetDes: [],
      cocMappings: [],
    }))
    result.des = [...result.des, ...newDeRows]
    const newAocUids = newDsAocUids.filter(
      (aocUid) => !oldDsAocUids.includes(aocUid)
    )
    const newAocRows = newAocUids.map((aocUid) => ({
      sourceAocs: [aocUid],
      targetAocs: [],
    }))
    result.aocs = [...result.aocs, ...newAocRows]
  }
  if (result.des.length > 0 || result.aocs.length > 0) {
    return result
  } else {
    return null
  }
}

/**
 * Compare the new and old data sets, and determine what (if anything) needs to be updated
 * @param {object} updatedDataSet New data set
 * @param {string} mappingDestination Determines which parts of the current mapping to updatedDataSet
 * @param {object} config Holds the current mapping and previous data set configuration
 */
function updateMapping(updatedDataSet, mappingDestination, config) {
  const { currentMappings, previousDs } = config
  const removedMetadata = getRemovedMetadata(previousDs, updatedDataSet)
  let newMetadata = { des: [], aocs: [] }
  if (mappingDestination === mappingDestinations.SOURCE) {
    // Only need to calculate for new source metadata because new target metadata
    // will not cause new rows in the mapping table
    // so does not need to be checked, the assitional options will show
    // in the updated metadata though
    newMetadata = getNewMetadata(previousDs, updatedDataSet)
  }
  const result = currentMappings
  if (removedMetadata) {
    const config = { removedMetadata, mappingDestination }
    result.des = currentMappings.des
      .map((deMap) => removeDesCocs(deMap, config))
      .filter(Boolean) // Remove null values from invalid mappings
    result.aocs = currentMappings.aocs
      .map((aocMap) => removeAocs(aocMap, config))
      .filter(Boolean) // Remove null values from invalid mappings
  }
  if (newMetadata) {
    result.des = [...result.des, ...newMetadata.des]
    result.aocs = [...result.aocs, ...newMetadata.aocs]
  }
  if (removedMetadata || newMetadata) {
    return result
  } else {
    return null
  }
}

/**
 * Check the updated data set metadata, and change the current mappings if
 * required
 * @param {object} newDsConfig Object with the new data set metadata and
 * @param {object} sharedState Contains current mapping and setting functions
 */
export function updateRequiredMappings(newDsConfig, sharedState) {
  const { SOURCE, TARGET } = mappingDestinations
  const config = {
    currentMappings: {
      des: sharedState.currentMapping,
      aocs: sharedState.currentMappingAocs,
    },
  }
  let newMapping = config.currentMappings
  let mappingUpdated = false
  if (newDsConfig?.source) {
    config.previousDs = sharedState.sourceDs
    const updatedMapping = updateMapping(newDsConfig.source, SOURCE, config)
    sharedState.setSourceDs(newDsConfig.source)
    if (updatedMapping) {
      mappingUpdated = true
      newMapping = updatedMapping
      // To make sure updates from the target include source changes
      config.currentMappings = newMapping
    }
  }
  if (newDsConfig?.target) {
    config.previousDs = sharedState.targetDs
    const updatedMapping = updateMapping(newDsConfig.target, TARGET, config)
    sharedState.setTargetDs(newDsConfig.target)
    if (updatedMapping) {
      mappingUpdated = true
      newMapping = updatedMapping
    }
  }
  if (mappingUpdated) {
    sharedState.setCurrentMapping(newMapping.des)
    sharedState.setCurrentMappingAocs(newMapping.aocs)
  }
}

function arrayToObjectByKey(array, keys) {
  const keyArray = Array.isArray(keys) ? keys : [keys]
  const result = {}
  for (const item of array) {
    let itemKey = item[keyArray[0]]
    for (const key of keyArray.slice(1)) {
      itemKey = itemKey[key]
    }
    result[itemKey] = item
  }
  return result
}

// Swap all the arrays in the data set (which can cause lodas isEqual to fail)
// to objects using the id for each item in the original array as the key
function makeComparibleDataSet(dataSet) {
  return {
    ...dataSet,
    categoryCombo: {
      ...dataSet.categoryCombo,
      categoryOptionCombos: arrayToObjectByKey(
        dataSet.categoryCombo.categoryOptionCombos,
        'id'
      ),
    },
    dataSetElements: arrayToObjectByKey(
      dataSet.dataSetElements.map((dse) => ({
        dataElement: {
          ...dse.dataElement,
          categoryCombo: {
            categoryOptionCombos: arrayToObjectByKey(
              dse.dataElement.categoryCombo.categoryOptionCombos,
              'id'
            ),
          },
        },
      })),
      ['dataElement', 'id']
    ),
  }
}

export function dataSetsEquivalent(dataSets1In, dataSets2In) {
  // transform lists into sets for lodash equal comparison
  const ds1 = new Set(dataSets1In.map((ds) => makeComparibleDataSet(ds)))
  const ds2 = new Set(dataSets2In.map((ds) => makeComparibleDataSet(ds)))
  return isEqual(ds1, ds2)
}
