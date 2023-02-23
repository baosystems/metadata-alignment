import { isEqual, uniqBy } from 'lodash'
import {
  aocCsvExportHeaders as aocHeader,
  deCocCsvExportHeaders as deCocHeader,
  mappingDestinations,
  ouCsvExportHeaders as ouHeader,
  tableTypeKeys,
  tableTypes,
} from '../components/MappingPage/MappingConsts'
import { metaTypes } from '../mappingContext'

export function flatten(arr, keyPath) {
  const result = []
  const valuePath = Array.isArray(keyPath) ? keyPath : [keyPath]
  for (const item of arr) {
    let value = item
    for (const key of valuePath) {
      value = value?.[key]
    }
    result.push(...value)
  }
  return result
}

export function flattenOus(dSets) {
  const ous = []

  for (const { organisationUnits } of dSets) {
    if (organisationUnits) {
      ous.push(
        ...organisationUnits.map((ou) => ({
          id: ou.id,
          name:
            ou.ancestors.map((ancestor) => ancestor.name).join(' > ') +
            ' > ' +
            ou.name,
          ouName: ou.name,
        }))
      )
    }
  }

  return ous.sort(sortMapping)
}

export const sortMapping = (a, b) =>
  a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1

const makeMap = (arr, keyName, valueName) => {
  const result = {}
  for (const item of arr) {
    result[item[keyName]] = item[valueName]
  }
  return result
}

const sortMappingConfig = (mappings, sourceKey, idNameMap) => {
  const getMapName = (mapping, sourceKey) => {
    const sourceItems = mapping?.[sourceKey]
    return (idNameMap[sourceItems?.[0]] || 'zzz').toLowerCase()
  }
  return mappings.sort((mappingA, mappingB) => {
    const sourceAName = getMapName(mappingA, sourceKey)
    const sourceBName = getMapName(mappingB, sourceKey)
    return sourceAName < sourceBName ? -1 : 1
  })
}

export const sortInitialMapping = (mappings, sourceMeta, metaType) => {
  if (!Array.isArray(mappings)) {
    return mappings
  }
  const idNameMap = makeMap(sourceMeta, 'id', 'name')
  const sourceKey = tableTypeKeys[metaType]?.sourceKey
  if (!sourceKey) {
    throw new Error('Invalid meta type: ' + metaType)
  }
  const result = sortMappingConfig(mappings, sourceKey, idNameMap)

  if (metaType === tableTypes.DE) {
    const cocArray = []
    sourceMeta.map((sourceData) =>
      sourceData?.categoryCombo.categoryOptionCombos.map((eachCOC) =>
        cocArray.push(eachCOC)
      )
    )
    const filteredCocArray = uniqBy(cocArray, 'id').sort(sortMapping)
    for (const dataElementMapping of mappings) {
      dataElementMapping.cocMappings.sort((a, b) => {
        return (
          filteredCocArray
            .map((arrayItem) => arrayItem.id)
            .indexOf(a.sourceCocs[0]) -
          filteredCocArray
            .map((arrayItem) => arrayItem.id)
            .indexOf(b.sourceCocs[0])
        )
      })
    }
  }

  return result
}

export function flattenDataSetElements(dSets) {
  const des = []
  for (const { dataSetElements } of dSets) {
    des.push(...dataSetElements.map((dse) => dse.dataElement))
  }
  return des.sort(sortMapping).map((de) => {
    const cocs = de?.categoryCombo?.categoryOptionCombos || []
    const sortedCocs = cocs.sort(sortMapping)
    return { ...de, categoryCombo: { categoryOptionCombos: sortedCocs } }
  })
}

export function flattenAocs(dSets) {
  const aocs = []

  for (const { categoryCombo } of dSets) {
    aocs.push(...categoryCombo.categoryOptionCombos)
  }

  return aocs.sort(sortMapping)
}

export function getCocs(deIds, deCocMap) {
  const cocs = []
  for (const deId of deIds) {
    cocs.push(...deCocMap[deId])
  }
  return cocs.sort(sortMapping)
}

export function getSourceNames(opts, ids) {
  const names = []
  for (const opt of opts) {
    if (ids.includes(opt.id)) {
      names.push(opt.name)
    }
  }

  return names.sort(sortMapping)
}

export function autoFill(config) {
  const { rankedTgtOpts, matchThreshold, sourceItems } = config
  if (rankedTgtOpts.length === 0) {
    return []
  }
  const bestMatch = rankedTgtOpts[0]
  if (rankedTgtOpts.length === 1) {
    return [bestMatch.id]
  }
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

const getCocSuggestionParams = (idx, config) => ({
  suggestions: config.suggestions, // Because the same object has the DE and COC suggestions
  sourceItems: config.sourceItems[idx].categoryCombo.categoryOptionCombos,
  matchThreshold: config.matchThreshold,
  setValues: config.setValues[idx].cocSetters,
  tableType: tableTypes.COC,
})

export function populateSuggestions(currentMapping, config, notify) {
  const { showSuccess, hideInfo } = notify
  const { suggestions, sourceItems, matchThreshold, setValues, tableType } =
    config
  const { sourceKey, targetKey } = tableTypeKeys[tableType]
  if (Object.keys(suggestions).length === 0) {
    return // Cannot populate without suggestions
  }
  for (const [idx, mapping] of currentMapping.entries()) {
    if (mapping[targetKey].length > 0) {
      // Do not autofill if there's a target value there already
      if (tableType === tableTypes.DE) {
        // But still check COCs for rows with DE target values
        populateSuggestions(
          mapping.cocMappings,
          getCocSuggestionParams(idx, config),
          notify
        )
      }
    } else {
      const suggestedMapping = autoFill({
        rankedTgtOpts: suggestions?.[mapping?.[sourceKey]?.[0]], // Only suggest on first source option
        matchThreshold,
        sourceItems,
      })
      if (suggestedMapping.length > 0) {
        setValues[idx][targetKey](suggestedMapping)
        if (tableType === tableTypes.DE) {
          populateSuggestions(
            mapping.cocMappings,
            getCocSuggestionParams(idx, config),
            notify
          )
        }
      }
    }
  }
  hideInfo()
  showSuccess(`Successfully populated ${tableType} suggestions`)
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
  const oldOus = dsOld.organisationUnits || []
  const oldOuUids = oldOus.map(({ id }) => id)
  const newOus = dsNew?.organisationUnits || []
  const newOuUids = newOus.map(({ id }) => id)

  const result = {
    aocs: oldAocUids.filter((aocId) => !newAocUids.includes(aocId)),
    cocs: oldCocUids.filter((cocId) => !newCocUids.includes(cocId)),
    des: oldDeUids.filter((deId) => !newDeUids.includes(deId)),
    ous: oldOuUids.filter((ouId) => !newOuUids.includes(ouId)),
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
    ous: [],
  }
  for (const oldDs of oldDataSets) {
    const newDs = newDataSets.find((newDs) => newDs.id === oldDs.id)
    const dsResult = getRemovedDsMetadata(oldDs, newDs || {})
    if (dsResult) {
      result.aocs = [...result.aocs, ...dsResult.aocs]
      result.des = [...result.des, ...dsResult.des]
      result.cocs = [...result.cocs, ...dsResult.cocs]
      result.ous = [...result.ous, ...dsResult.ous]
    }
  }
  if (Object.values(result).some((val) => val && val.length > 0)) {
    return {
      aocs: Array.from(new Set(result.aocs)),
      des: Array.from(new Set(result.des)),
      cocs: Array.from(new Set(result.cocs)),
      ous: Array.from(new Set(result.ous)),
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
  const removedAocs = removedMetadata?.aocs || []
  const aocKey = `${mappingDestination}Aocs`
  const result = {
    ...aocMap,
    [aocKey]: removeIfIn(aocMap[aocKey], removedAocs),
  }
  // If there are no source aocs left, then this mapping row should be removed
  return result.sourceAocs.length > 0 ? result : null
}

/**
 * Update an ou mapping by removing the ous specified. If there is no longer
 * a source ou left then return null as the row is no longer valid
 * @param {Object} ouMap Mapping row for ous
 * @param {Object} config Holds which fields should be removed and what the destination is
 * @returns An updated ou mapping row if the row is still valid, otherwise null
 */
function removeOus(ouMap, config) {
  const { removedMetadata, mappingDestination } = config
  const removedOus = removedMetadata?.ous || []
  const ouKey = `${mappingDestination}Ous`
  const result = {
    ...ouMap,
    [ouKey]: removeIfIn(ouMap[ouKey], removedOus),
  }
  // If there are no source ous left, then this mapping row should be removed
  return result.sourceOus.length ? result : null
}

function getNewMetadata(oldDataSets, newDataSets) {
  const result = { des: [], aocs: [], ous: [] }
  for (const newDs of newDataSets) {
    const oldDs = oldDataSets.find((oldDs) => newDs.id === oldDs.id)
    const oldDsAocUids = (oldDs?.categoryCombo?.categoryOptionCombos || []).map(
      ({ id }) => id
    )
    const newDsAocUids = (newDs?.categoryCombo?.categoryOptionCombos || []).map(
      ({ id }) => id
    )
    const oldDsOuUids = (oldDs.organisationUnits || []).map(({ id }) => id)
    const newDsOuUids = (newDs?.organisationUnits || []).map(({ id }) => id)
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

    const newOuUids = newDsOuUids.filter(
      (ouUid) => !oldDsOuUids.includes(ouUid)
    )
    const newOuRows = newOuUids.map((ouUid) => ({
      sourceOus: [ouUid],
      targetOus: [],
    }))
    result.ous = [...result.ous, ...newOuRows]
  }

  if (result.des.length || result.aocs.length || result.ous.length) {
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
  let newMetadata = { des: [], aocs: [], ous: [] }
  if (mappingDestination === mappingDestinations.SOURCE) {
    // Only need to calculate for new source metadata because new target metadata
    // will not cause new rows in the mapping table
    // so does not need to be checked, the additional options will show
    // in the updated metadata though
    newMetadata = getNewMetadata(previousDs, updatedDataSet)
  }
  const result = currentMappings
  if (removedMetadata) {
    const config = { removedMetadata, mappingDestination }
    result.des = currentMappings?.des
      ? currentMappings.des
          .map((deMap) => removeDesCocs(deMap, config))
          .filter(Boolean)
      : []
    result.aocs = currentMappings?.aocs
      ? currentMappings.aocs
          .map((aocMap) => removeAocs(aocMap, config))
          .filter(Boolean)
      : []
    result.ous = currentMappings?.ous
      ? currentMappings.ous
          .map((ouMap) => removeOus(ouMap, config))
          .filter(Boolean)
      : []
  }

  if (newMetadata) {
    result.des = [...result.des, ...newMetadata.des]
    result.aocs = [...result.aocs, ...newMetadata.aocs]
    result.ous =
      result.ous && result.ous.length
        ? [...result.ous, ...newMetadata.ous]
        : [...newMetadata.ous]
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
      ous: sharedState.currentMappingOus,
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
    sharedState.setCurrentMapping[tableTypes.DE](newMapping.des)
    sharedState.setCurrentMapping[tableTypes.AOC](newMapping.aocs)
    sharedState.setCurrentMapping[tableTypes.OU](newMapping.ous)
  }
}

function arrayToObjectByKey(array, keys) {
  if (array) {
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
}

// Swap all the arrays in the data set (which can cause lodash isEqual to fail)
// to objects using the id for each item in the original array as the key
function makeComparableDataSet(dataSet) {
  return {
    id: dataSet.id,
    name: dataSet.name,
    categoryCombo: {
      ...dataSet.categoryCombo,
      categoryOptionCombos: arrayToObjectByKey(
        dataSet.categoryCombo.categoryOptionCombos,
        'id'
      ),
    },
    organisationUnits: arrayToObjectByKey(dataSet.organisationUnits, 'id'),
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

export function getExportMappingData(
  headers,
  mappings,
  tableType,
  extraHeader
) {
  const result = [headers]

  if (Array.isArray(extraHeader) && extraHeader.length > 0) {
    result.unshift(extraHeader)
  }

  const keys = tableTypeKeys[tableType]

  for (const mapping of mappings) {
    const source = mapping[keys.sourceKey]
    const target = mapping[keys.targetKey]
    if (target.length > 1) {
      throw Error(
        `Only single target ${tableType} mappings are currently supported`
      )
    }

    for (const id of source) {
      result.push([id, target[0]])
    }
  }

  return result
}

export function getExportMappingDataDeCoc(deCocMappings, extraHeader = null) {
  const result = [deCocHeader]

  if (Array.isArray(extraHeader) && extraHeader.length > 0) {
    result.unshift(extraHeader)
  }

  for (const { cocMappings, sourceDes, targetDes } of deCocMappings) {
    if (targetDes.length > 1) {
      throw Error('Only single target de mappings are currently supported')
    }
    for (const { sourceCocs, targetCocs } of cocMappings) {
      if (targetCocs.length > 1) {
        throw Error('Only single target coc mappings are currently supported')
      }
      for (const deUid of sourceDes) {
        for (const cocUid of sourceCocs) {
          result.push([deUid, cocUid, targetDes[0], targetCocs[0]])
        }
      }
    }
  }

  return result
}

export function dataSetsEquivalent(dataSets1In, dataSets2In) {
  // transform lists into sets for lodash equal comparison
  const ds1 = new Set(dataSets1In.map((ds) => makeComparableDataSet(ds)))
  const ds2 = new Set(dataSets2In.map((ds) => makeComparableDataSet(ds)))
  return isEqual(ds1, ds2)
}

export function getFileFromMapping(mapping, mappingType) {
  let result = []

  if (mappingType === metaTypes.DE_COC) {
    result = getExportMappingDataDeCoc(mapping)
  } else if (mappingType === metaTypes.AOC) {
    result = getExportMappingData(aocHeader, mapping, mappingType)
  } else if (mappingType === metaTypes.OU) {
    result = getExportMappingData(ouHeader, mapping, mappingType)
  }

  const csvContent = result.map((e) => `"${e.join('","')}"`).join('\n')
  return new Blob([csvContent], {
    type: 'data:text/csv;charset=utf-8;',
  })
}
