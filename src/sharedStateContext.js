import { useState, useCallback, createContext } from 'react'

export const SharedStateContext = createContext({
  sourceDs: {},
  setSourceDs: () => {},
  sourceUrl: '',
  setSourceUrl: () => {},
  targetDs: {},
  setTargetDs: () => {},
  targetUrl: '',
  setTargetUrl: () => {},
  currentMapping: [],
  setCurrentMapping: () => {},
  currentMappingAocs: [],
  setCurrentMappingAocs: () => {},
  currentMappingOus: [],
  setCurrentMappingOus: () => {},
  sourceRootOu: {},
  setSourceRootOu: () => {},
  targetRootOu: [],
  setTargetRootOu: () => {},
})

export const useSharedState = () => {
  const [sourceDs, setSourceDsInternal] = useState([])
  const [sourceUrl, setSourceUrlInternal] = useState('')
  const [targetDs, setTargetDsInternal] = useState([])
  const [targetUrl, setTargetUrlInternal] = useState('')
  const [currentMapping, setCurrentMappingInternal] = useState({})
  const [currentMappingAocs, setCurrentMappingAocsInternal] = useState({})
  const [currentMappingOus, setCurrentMappingOusInternal] = useState({})

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
  const setCurrentMapping = useCallback((mapping) => {
    setCurrentMappingInternal(mapping)
  }, [])
  const setCurrentMappingAocs = useCallback((mapping) => {
    setCurrentMappingAocsInternal(mapping)
  }, [])
  const setCurrentMappingOus = useCallback((mapping) => {
    setCurrentMappingOusInternal(mapping)
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
    currentMapping,
    setCurrentMapping,
    currentMappingAocs,
    setCurrentMappingAocs,
    currentMappingOus,
    setCurrentMappingOus,
  }
}
