import { createContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  tableTypeKeys,
  tableTypes,
} from './components/MappingPage/MappingConsts'
import { sortInitialMapping } from './utils/mappingUtils'

export const metaTypes = {
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
    return initializeGenericMap(source, metaType)
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

function initializeGenericMap(sourceMeta, metaType) {
  const result = []
  if (!sourceMeta) {
    return result
  }

  const metaKeys = tableTypeKeys[metaType]
  for (const sourceItem of sourceMeta) {
    result.push({
      [metaKeys.sourceKey]: [sourceItem.id],
      [metaKeys.targetKey]: [],
    })
  }

  return result
}

function initializeAllMaps(allInitVals, allMetadata, deCocMap) {
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
  const initialMappings = useMemo(() => {
    return {
      [DE_COC]: sortInitialMapping(initMapping, sourceDes, tableTypes.DE),
      [AOC]: sortInitialMapping(initMappingAocs, sourceAocs, tableTypes.AOC),
      [OU]: sortInitialMapping(initMappingOus, sourceOus, tableTypes.OU),
    }
  }, [initMapping, initMappingAocs, initMappingOus])

  const metadata = {
    [DE_COC]: { source: sourceDes, target: targetDes },
    [AOC]: { source: sourceAocs, target: targetAocs },
    [OU]: { source: sourceOus, target: targetOus },
  }
  const deCocMap = makeDeCocMap(sourceDes, targetDes)
  const initialValues = initializeAllMaps(initialMappings, metadata, deCocMap)
  const { [DE_COC]: initDeCoc, [AOC]: initAoc, [OU]: initOu } = initialValues
  const [deCocMappings, setDeCocMappingsInternal] = useState(initDeCoc)
  const [aocMappings, setAocMappingsInternal] = useState(initAoc)
  const [ouMappings, setOuMappingsInternal] = useState(initOu)
  const [ouSetters, setOuSetters] = useState([])
  const ouSetterCountRef = useRef(ouSetters.length)
  const setterMap = useMemo(
    () => ({
      [DE_COC]: setDeCocMappingsInternal,
      [AOC]: setAocMappingsInternal,
      [OU]: setOuMappingsInternal,
    }),
    []
  )

  // Effect to refresh the mappings on refresh metadata
  useEffect(() => {
    for (const metaType in initialMappings) {
      const initialMapping = initialMappings[metaType]
      if (initialMapping && initialMapping.length > 0) {
        setterMap[metaType](initialMapping)
      }
    }
  }, [initialMappings, setterMap])

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

  useEffect(() => {
    if (ouMappings.length === ouSetterCountRef.current) {
      return
    }
    const result = []
    for (let i = 0; i < ouMappings.length; i++) {
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
      result.push({ ...rowSetter })
    }
    ouSetterCountRef.current = result.length
    setOuSetters(result)
  }, [ouMappings])

  return {
    deCocMappings,
    setDeCocMappings,
    aocMappings,
    setAocMappings,
    ouMappings,
    setOuMappings: ouSetters,
    deCocMap,
  }
}
