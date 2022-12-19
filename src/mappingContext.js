import { createContext, useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'

const metaTypes = {
  DE_COC: 'deCoc',
  AOC: 'aoc',
  OU: 'ou',
}

const { DE_COC, AOC, OU } = metaTypes

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

function initializeMap(source, metaType, deCocMap) {
  if (metaType === DE_COC) {
    return initializeDeCocMap(source, deCocMap)
  } else {
    return initializeGenericMap(source)
  }
}

function initializeDeCocMap(srcDeArr, deCocMap) {
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

function initializeGenericMap(sourceMeta) {
  const result = []
  if (!sourceMeta) {
    return result
  }
  for (const sourceItem of sourceMeta) {
    result.push({
      source: [sourceItem.id],
      target: [],
    })
  }

  return result
}

function initilizeAllMaps(allInitVals, allMetadata, deCocMap) {
  const result = {}
  const metaTypes = [DE_COC, AOC, OU]
  for (const metaType of metaTypes) {
    const initVals = allInitVals[metaType]
    const metadata = allMetadata[metaType]
    const existingMapping = initVals && initVals.length > 0
    result[metaType] = existingMapping
      ? initVals
      : initializeMap(metadata.source, metaType, deCocMap)
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
  sourceOus,
  targetOus,
  initMapping,
  initMappingAocs,
  initMappingOus
) => {
  const initialMappings = {
    [DE_COC]: initMapping,
    [AOC]: initMappingAocs,
    [OU]: initMappingOus,
  }
  const metadata = {
    [DE_COC]: { source: sourceDes, target: targetDes },
    [AOC]: { source: sourceAocs, target: targetAocs },
    [OU]: { source: sourceOus, target: targetOus },
  }
  const deCocMap = makeDeCocMap(sourceDes, targetDes)
  const initialValues = initilizeAllMaps(initialMappings, metadata, deCocMap)
  const { [DE_COC]: initDeCoc, [AOC]: initAoc, [OU]: initOu } = initialValues
  const [deCocMappings, setDeCocMappingsInternal] = useState(initDeCoc)
  const [aocMappings, setAocMappingsInternal] = useState(initAoc)
  const [ouMappings, setOuMappingsInternal] = useState(initOu)
  const setterMap = {
    [DE_COC]: setDeCocMappingsInternal,
    [AOC]: setAocMappingsInternal,
    [OU]: setOuMappingsInternal,
  }

  // Effect to refresh the mappings on refresh metadata
  useEffect(() => {
    for (const metaType in initialMappings) {
      const initialMapping = initialMappings[metaType]
      if (initialMapping && initialMapping.length > 0) {
        setterMap[metaType](initialMapping)
      }
    }
  }, [initialMappings])

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

  const setOuMappings = []
  for (let i = 0; i < ouMappings.length; i++) {
    console.log('Creating OU setter')
    const rowSetter = {
      sourceOus: (v) => {
        const newMappings = [...ouMappings]
        newMappings[i].sourceOus = v
        setOuMappingsInternal(newMappings)
      },
      targetOus: (v) => {
        const newMappings = [...ouMappings]
        newMappings[i].targetOus = v
        setOuMappingsInternal(newMappings)
      },
    }
    setOuMappings.push({ ...rowSetter })
  }

  return {
    deCocMappings,
    setDeCocMappings,
    aocMappings,
    setAocMappings,
    ouMappings,
    setOuMappings,
    deCocMap,
    rankedSuggestions,
    rankedSuggestionsAocs,
  }
}
