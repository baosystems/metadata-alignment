import { createContext, useState, useCallback, useMemo } from 'react'
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

function initaliseMap(srcDeArr, deCocMap) {
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

export const useMappingState = (sourceDes, targetDes, initMapping) => {
  let initVal = []
  const deCocMap = makeDeCocMap(sourceDes, targetDes)
  const existingMapping = initMapping && initMapping.length > 0
  if (existingMapping) {
    initVal = initMapping
  } else {
    initVal = initaliseMap(sourceDes, deCocMap)
  }
  const [mappings, setMappingsInternal] = useState(initVal)
  const rankedSuggestions = useMemo(
    () => createSimilarityMatrix(sourceDes, targetDes),
    []
  )
  const setMappings = []
  for (let i = 0; i < mappings.length; i++) {
    const rowSetter = {
      sourceDes: useCallback((v) => {
        const newMappings = [...mappings]
        newMappings[i].sourceDes = v
        setMappingsInternal(newMappings)
      }),
      targetDes: useCallback((v) => {
        const newMappings = [...mappings]
        newMappings[i].targetDes = v
        setMappingsInternal(newMappings)
      }),
    }
    const cocSetters = []
    for (let j = 0; j < mappings[i].cocMappings.length; j++) {
      cocSetters.push({
        sourceCocs: useCallback((v) => {
          const newMappings = [...mappings]
          newMappings[i].cocMappings[j].sourceCocs = v
          setMappingsInternal(newMappings)
        }),
        targetCocs: useCallback((v) => {
          const newMappings = [...mappings]
          newMappings[i].cocMappings[j].targetCocs = v
          setMappingsInternal(newMappings)
        }),
      })
    }
    setMappings.push({ ...rowSetter, cocSetters: cocSetters })
  }
  return { mappings, setMappings, deCocMap, rankedSuggestions }
}
