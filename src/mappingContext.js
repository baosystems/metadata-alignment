import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react'
import {
  tableTypeKeys,
  tableTypes,
} from './components/MappingPage/MappingConsts'
import { replaceInArray, sortInitialMapping } from './utils/mappingUtils'

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

function getCocCount(deCocMappings) {
  return deCocMappings.reduce((acc, curr) => acc + curr.cocMappings.length, 0)
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
  const [deSetters, setDeSetters] = useState([])
  const [aocSetters, setAocSetters] = useState([])
  const [ouSetters, setOuSetters] = useState([])
  const deSetterCountRef = useRef(deSetters.length)
  const cocSetterCountRef = useRef(getCocCount(deCocMappings))
  const aocSetterCountRef = useRef(aocSetters.length)
  const ouSetterCountRef = useRef(ouSetters.length)
  const rowStateMap = useMemo(
    () => ({
      [tableTypes.DE]: [deCocMappings, setDeCocMappingsInternal],
      [tableTypes.AOC]: [aocMappings, setAocMappingsInternal],
      [tableTypes.OU]: [ouMappings, setOuMappingsInternal],
    }),
    [deCocMappings, aocMappings, ouMappings]
  )
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

  useEffect(() => {
    const deCountUnchanged = deCocMappings.length === deSetterCountRef.current
    const cocCountUnchanged =
      getCocCount(deCocMappings) === cocSetterCountRef.current
    if (deCountUnchanged && cocCountUnchanged) {
      return
    }
    const result = []
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
      result.push({ ...rowSetter, cocSetters: cocSetters })
    }
    deSetterCountRef.current = result.length
    cocSetterCountRef.current = getCocCount(deCocMappings)
    setDeSetters(result)
  }, [deCocMappings])

  useEffect(() => {
    if (aocMappings.length === aocSetterCountRef.current) {
      return
    }
    const result = []
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
      result.push({ ...rowSetter })
    }
    aocSetterCountRef.current = result.length
    setAocSetters(result)
  }, [aocMappings])

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

  const addRowOfType = useCallback(
    (tableType) => {
      const { sourceKey, targetKey } = tableTypeKeys[tableType]
      const emptyRow = { [sourceKey]: [], [targetKey]: [] }
      tableType === tableTypes.DE ? (emptyRow.cocMappings = []) : undefined
      const [val, setVal] = rowStateMap[tableType]
      setVal([emptyRow, ...val])
    },
    [rowStateMap]
  )

  const addCocRow = (deRowIdx) => {
    const { sourceKey, targetKey } = tableTypeKeys[tableTypes.COC]
    const emptyRow = { [sourceKey]: [], [targetKey]: [] }
    const deRow = deCocMappings[deRowIdx]
    deRow.cocMappings = [emptyRow, ...deRow.cocMappings]
    setDeCocMappingsInternal(replaceInArray(deCocMappings, deRowIdx, deRow))
  }

  const removeCocRow = (deRowIdx, removeIdx) => {
    const deRow = { ...deCocMappings[deRowIdx] }
    deRow.cocMappings = deRow.cocMappings.filter((_, idx) => idx !== removeIdx)
    setDeCocMappingsInternal(replaceInArray(deCocMappings, deRowIdx, deRow))
  }

  const removeRow = useCallback(
    (removeIdx, tableType) => {
      const [val, setVal] = rowStateMap[tableType]
      setVal(val.filter((_, idx) => idx !== removeIdx))
    },
    [rowStateMap]
  )

  return {
    deCocMappings,
    setDeCocMappings: deSetters,
    aocMappings,
    addRow: {
      [tableTypes.DE]: () => addRowOfType(tableTypes.DE),
      [tableTypes.COC]: (deRowIdx) => addCocRow(deRowIdx),
      [tableTypes.AOC]: () => addRowOfType(tableTypes.AOC),
      [tableTypes.OU]: () => addRowOfType(tableTypes.OU),
    },
    removeRow: {
      [tableTypes.DE]: (idx) => removeRow(idx, tableTypes.DE),
      [tableTypes.COC]: (deRowIdx, idx) => removeCocRow(deRowIdx, idx),
      [tableTypes.AOC]: (idx) => removeRow(idx, tableTypes.AOC),
      [tableTypes.OU]: (idx) => removeRow(idx, tableTypes.OU),
    },
    setAocMappings: aocSetters,
    ouMappings,
    setOuMappings: ouSetters,
    deCocMap,
  }
}
