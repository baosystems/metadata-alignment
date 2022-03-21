import { createContext, useState, useCallback, useMemo } from 'react'
import Fuse from 'fuse.js'

export const MappingContext = createContext({
  mappings: [],
  setMapping: () => {},
})

function makeDeCocMap(deArr) {
  const result = {}
  for (const de of deArr) {
    result[de.id] = de.categoryCombo.categoryOptionCombos
  }
  return result
}

function initaliseMap(srcDeArr, deCocMap) {
  const result = []
  for (const de of srcDeArr) {
    const srcCocs = deCocMap[de.id]
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

function makeRankedSuggestions(sourceIdNmArr, targetIdNmArr, srcIdNmMap) {
  const fuseOpts = {
    includeScore: true,
    shouldSort: true,
    threshold: 1.0,
    findAllMatches: true,
    ignoreLocation: true,
    keys: ['name'],
  }
  const sourceIds = sourceIdNmArr.map(({ id }) => id)
  const tgtIdNms = targetIdNmArr.map(({ id, name }) => ({ id, name }))
  const fuseMatcher = new Fuse(tgtIdNms, fuseOpts)
  const simtrix = {}
  for (const id of sourceIds) {
    const orderedSimilarities = fuseMatcher.search(srcIdNmMap[id])
    simtrix[id] = orderedSimilarities.map((deMatch) => ({
      id: deMatch.item.id,
      name: deMatch.item.name,
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

export const useMappingState = (sourceDes, targetDes) => {
  const deCocMap = makeDeCocMap([...sourceDes, ...targetDes])
  const initVal = initaliseMap(sourceDes, deCocMap)
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
