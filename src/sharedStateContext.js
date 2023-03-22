import { useState, useCallback, createContext } from 'react'
import { tableTypes } from './components/MappingPage/MappingConsts'

export const SharedStateContext = createContext({
  sourceDs: {},
  setSourceDs: () => {},
  sourceUrl: '',
  setSourceUrl: () => {},
  targetDs: {},
  setTargetDs: () => {},
  targetUrl: '',
  setTargetUrl: () => {},
  currentMapping: {},
  setCurrentMapping: () => {},
  sourceRootOu: {},
  setSourceRootOu: () => {},
  targetRootOu: [],
  setTargetRootOu: () => {},
  mappingPipelines: {},
  setMappingPipelines: () => {},
})

export const useSharedState = () => {
  const [sourceDs, setSourceDsInternal] = useState([])
  const [sourceUrl, setSourceUrlInternal] = useState('')
  const [targetDs, setTargetDsInternal] = useState([])
  const [targetUrl, setTargetUrlInternal] = useState('')
  const [currentMappingDes, setCurrentMappingDesInternal] = useState({})
  const [currentMappingAocs, setCurrentMappingAocsInternal] = useState({})
  const [currentMappingOus, setCurrentMappingOusInternal] = useState({})
  const [mappingPipelines, setMappingPipelinesInternal] = useState({})

  const setSourceDs = useCallback((ds) => {
    setSourceDsInternal(ds)
  }, [])
  const setSourceUrl = useCallback((url) => {
    setSourceUrlInternal(url)
  }, [])
  const setTargetDs = useCallback((ds) => {
    setTargetDsInternal(ds)
  }, [])
  const setTargetUrl = useCallback((url) => {
    setTargetUrlInternal(url)
  }, [])
  const setCurrentMappingDes = useCallback((mapping) => {
    setCurrentMappingDesInternal(mapping)
  }, [])
  const setCurrentMappingAocs = useCallback((mapping) => {
    setCurrentMappingAocsInternal(mapping)
  }, [])
  const setCurrentMappingOus = useCallback((mapping) => {
    setCurrentMappingOusInternal(mapping)
  }, [])
  const setMappingPipelines = useCallback((mappingPipelines) => {
    setMappingPipelinesInternal(mappingPipelines)
  }, [])

  return {
    sourceDs,
    setSourceDs,
    sourceUrl,
    setSourceUrl,
    targetDs,
    setTargetDs,
    targetUrl,
    setTargetUrl,
    currentMapping: {
      [tableTypes.DE]: currentMappingDes,
      [tableTypes.AOC]: currentMappingAocs,
      [tableTypes.OU]: currentMappingOus,
    },
    setCurrentMapping: {
      [tableTypes.DE]: setCurrentMappingDes,
      [tableTypes.AOC]: setCurrentMappingAocs,
      [tableTypes.OU]: setCurrentMappingOus,
    },
    mappingPipelines,
    setMappingPipelines,
  }
}
