import { createContext, useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'

export const MappingContext = createContext({
  mappings: [],
  setMapping: () => {},
})

function makeDeCocMap(sourceDeArr, targetDeArr) {
  const result = { source: {}, target: {} }
  for (const de of sourceDeArr) {
    result.source[de.id] = de.categoryCombo.categoryOptionCombos
  }
  for (const de of targetDeArr) {
    result.target[de.id] = de.categoryCombo.categoryOptionCombos
  }
  return result
}

function initialiseMap(srcDeArr, deCocMap) {
  const result = []
  for (const de of srcDeArr) {
    const srcCocs = deCocMap.source[de.id]
    result.push({
      sourceDes: [de.id],
      targetDes: [],
      cocMappings: srcCocs.map((coc) => ({
        sourceCocs: [coc.id],
        targetCocs: [],
      })),
    })
  }
  return result
}

function initialiseMapAocs(sourceAocs) {
  const result = []

  for (const aoc of sourceAocs) {
    result.push({
      sourceAocs: [aoc.id],
      targetAocs: [],
    })
  }

  return result
}

function createIdNmMap(sourceDes, targetDes) {
  const sourceDesMap = {}
  const targetDesMap = {}
  const sourceCocsMap = {}
  const targetCocsMap = {}
  for (const de of sourceDes) {
    sourceDesMap[de.id] = de.name
    for (const coc of de.categoryCombo.categoryOptionCombos) {
      if (!(coc in sourceCocsMap)) {
        sourceCocsMap[coc.id] = coc.name
      }
    }
  }
  for (const de of targetDes) {
    targetDesMap[de.id] = de.name
    for (const coc of de.categoryCombo.categoryOptionCombos) {
      if (!(coc in targetCocsMap)) {
        targetCocsMap[coc.id] = coc.name
      }
    }
  }
  return { sourceDesMap, targetDesMap, sourceCocsMap, targetCocsMap }
}

const nonLetterMap = {
  0: 'aaaaa',
  1: 'bbbbb',
  2: 'ccccc',
  3: 'ddddd',
  4: 'eeeee',
  5: 'fffff',
  6: 'ggggg',
  7: 'hhhhh',
  8: 'iiiii',
  9: 'jjjjj',
  '-': 'kkkkk',
  '+': 'lllll',
  '<': 'mmmmm',
  '>': 'nnnnn',
  ',': 'ooooo',
}
// Replace numbers and special characters with letters to help
// the fuse module match mostly numeric fields better
function letterifyString(s) {
  // Make male and female disaggregations more divergent
  const diverged = s.replace('Female', 'XXXXX')
  return diverged
    .split('')
    .map((c) => nonLetterMap[c] || c)
    .join('')
}

function letterifyObjValues(obj) {
  const result = {}
  for (const key in obj) {
    result[key] = letterifyString(obj[key])
  }
  return result
}

function makeRankedSuggestions(sourceIdNmArr, targetIdNmArr, srcIdNmMap) {
  const fuseOpts = {
    includeScore: true,
    shouldSort: true,
    isCaseSensitive: true,
    threshold: 1.0,
    findAllMatches: true,
    ignoreLocation: true,
    keys: ['abcName'],
  }
  const srcIdLetterifiedNmMap = letterifyObjValues(srcIdNmMap)
  const sourceIds = sourceIdNmArr.map(({ id }) => id)
  const tgtIdNms = targetIdNmArr.map(({ id, name }) => ({
    id,
    name,
    abcName: letterifyString(name),
  }))
  const fuseMatcher = new Fuse(tgtIdNms, fuseOpts)
  const simtrix = {}
  for (const id of sourceIds) {
    const orderedSimilarities = fuseMatcher.search(srcIdLetterifiedNmMap[id])
    simtrix[id] = orderedSimilarities.map((deMatch) => ({
      id: deMatch.item.id,
      name: deMatch.item.name,
      abcName: deMatch.item.abcName,
      score: deMatch.score,
    }))
  }
  return simtrix
}

function idNmArrayFromMap(idNameMap) {
  const result = []
  for (const id in idNameMap) {
    result.push({ id, name: idNameMap[id] })
  }
  return result
}

function createSimilarityMatrixAocs(sourceAocs, targetAocs) {
  console.log('Creating similarity matrix Aocs')
  const sourceIdNameMap = {}
  const targetIdNameMap = {}

  for (const { id, name } of sourceAocs) {
    sourceIdNameMap[id] = name
  }

  for (const { id, name } of targetAocs) {
    targetIdNameMap[id] = name
  }

  const sourceAocsArr = idNmArrayFromMap(sourceIdNameMap)
  const targetAocsArr = idNmArrayFromMap(targetIdNameMap)

  return {
    ...makeRankedSuggestions(sourceAocsArr, targetAocsArr, sourceIdNameMap),
  }
}

function createSimilarityMatrix(sourceDes, targetDes) {
  console.log('Creating similarity matrix')
  const idNmMap = createIdNmMap(sourceDes, targetDes)
  const sourceCocs = idNmArrayFromMap(idNmMap.sourceCocsMap)
  const targetCocs = idNmArrayFromMap(idNmMap.targetCocsMap)
  const srcDeIdNmMap = idNmMap.sourceDesMap
  const srcCocIdNmMap = idNmMap.sourceCocsMap
  return {
    ...makeRankedSuggestions(sourceDes, targetDes, srcDeIdNmMap),
    ...makeRankedSuggestions(sourceCocs, targetCocs, srcCocIdNmMap),
  }
}

export const useMappingState = (
  sourceDes,
  targetDes,
  sourceAocs,
  targetAocs,
  initMapping,
  initMappingAocs
) => {
  let initVal = []
  let initValAocs = []
  const deCocMap = makeDeCocMap(sourceDes, targetDes)
  const existingMapping = initMapping && initMapping.length > 0
  const existingMappingAocs = initMappingAocs && initMappingAocs.length > 0
  if (existingMapping) {
    initVal = initMapping
  } else {
    initVal = initialiseMap(sourceDes, deCocMap)
  }

  if (existingMappingAocs) {
    initValAocs = initMappingAocs
  } else {
    initValAocs = initialiseMapAocs(sourceAocs)
  }

  const [deCocMappings, setDeCocMappingsInternal] = useState(initVal)
  const [aocMappings, setAocMappingsInternal] = useState(initValAocs)

  // Effect to refresh the mappings on refresh metadata
  useEffect(() => {
    if (initMapping && initMapping.length > 0) {
      setDeCocMappingsInternal(initMapping)
    }
  }, [initMapping])

  // Effect to refresh the mappings on refresh metadata
  useEffect(() => {
    if (initMappingAocs && initMappingAocs.length > 0) {
      setAocMappingsInternal(initMappingAocs)
    }
  }, [initMappingAocs])

  const rankedSuggestions = useMemo(
    () => createSimilarityMatrix(sourceDes, targetDes),
    [sourceDes, targetDes]
  )

  const rankedSuggestionsAocs = useMemo(
    () => createSimilarityMatrixAocs(sourceAocs, targetAocs),
    [sourceAocs, targetAocs]
  )

  const setDeCocMappings = []
  for (let i = 0; i < deCocMappings.length; i++) {
    const rowSetter = {
      sourceDes: (v) => {
        const newMappings = [...deCocMappings]
        newMappings[i].sourceDes = v
        setDeCocMappingsInternal(newMappings)
      },
      targetDes: (v) => {
        const newMappings = [...deCocMappings]
        newMappings[i].targetDes = v
        setDeCocMappingsInternal(newMappings)
      },
    }
    const cocSetters = []
    for (let j = 0; j < deCocMappings[i].cocMappings.length; j++) {
      cocSetters.push({
        sourceCocs: (v) => {
          const newMappings = [...deCocMappings]
          newMappings[i].cocMappings[j].sourceCocs = v
          setDeCocMappingsInternal(newMappings)
        },
        targetCocs: (v) => {
          const newMappings = [...deCocMappings]
          newMappings[i].cocMappings[j].targetCocs = v
          setDeCocMappingsInternal(newMappings)
        },
      })
    }
    setDeCocMappings.push({ ...rowSetter, cocSetters: cocSetters })
  }

  const setAocMappings = []
  for (let i = 0; i < aocMappings.length; i++) {
    const rowSetter = {
      sourceAocs: (v) => {
        const newMappings = [...aocMappings]
        newMappings[i].sourceAocs = v
        setAocMappingsInternal(newMappings)
      },
      targetAocs: (v) => {
        const newMappings = [...aocMappings]
        newMappings[i].targetAocs = v
        setAocMappingsInternal(newMappings)
      },
    }
    setAocMappings.push({ ...rowSetter })
  }

  return {
    deCocMappings,
    setDeCocMappings,
    aocMappings,
    setAocMappings,
    deCocMap,
    rankedSuggestions,
    rankedSuggestionsAocs,
  }
}
