import { createContext, useState, useCallback } from 'react'

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

export const useMappingState = (sourceDes, targetDes) => {
  const deCocMap = makeDeCocMap([...sourceDes, ...targetDes])
  const initVal = initaliseMap(sourceDes, deCocMap)
  const [mappings, setMappingsInternal] = useState(initVal)
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
  return { mappings, setMappings, deCocMap }
}
