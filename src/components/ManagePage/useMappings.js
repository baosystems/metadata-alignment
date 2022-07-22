import { useState, useEffect, useMemo } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import { getFromDataStore } from '../../utils/dataStoreUtils'
import { MAPPING_INFO } from './ManagePageConsts'

export default function useMappings() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState([])
  const engine = useDataEngine()

  async function getMappings() {
    setLoading(true)
    setData([])
    setError(null)
    try {
      const dsMappings = await getFromDataStore(
        engine,
        'dataStore',
        MAPPING_INFO
      )
      setData(dsMappings || [])
      setLoading(false)
    } catch (e) {
      setLoading(false)
      setError(e)
    }
  }

  useEffect(() => {
    getMappings()
  }, [])

  return useMemo(() => ({ loading, error, data, refetch: getMappings }))
}
