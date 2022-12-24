import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from '@dhis2/ui'
import { useDataEngine, useAlert } from '@dhis2/app-runtime'
import { mappingsKey } from './MappingConsts'
import { getRowKey } from '../../utils/dataStoreUtils'
import { dataStoreKey } from '../SetupPage/SetupPageConsts'
import { mapConfigType } from './sharedPropTypes'

export const dsQuery = {
  namespaces: {
    resource: `dataStore`,
  },
}

export const keysQuery = {
  nameSpaceKeys: {
    resource: `dataStore/${dataStoreKey}`,
  },
}

const mappingsQuery = {
  mappings: {
    resource: `dataStore/${dataStoreKey}/${mappingsKey}`,
  },
}

const mappingsMutation = (type, maps) => ({
  type,
  resource: `dataStore/${dataStoreKey}/${mappingsKey}`,
  data: maps,
})

const SaveMapping = ({ mapConfig, deCocMappings, aocMappings, ouMappings }) => {
  const [loading, setLoading] = useState(false)
  const engine = useDataEngine()
  const { sourceDs, targetDs, sourceUrl, targetUrl } = mapConfig
  const { show: showErr } = useAlert((msg) => msg, { critical: true })
  const { show: showPass } = useAlert((msg) => msg, { success: true })
  const rowKey = getRowKey(mapConfig)
  const thisMap = {
    rowKey,
    sourceDs,
    targetDs,
    sourceUrl,
    targetUrl,
  }
  const handleSave = async () => {
    try {
      setLoading(true)
      const existingMaps = await getMaps(engine)
      const otherMaps = existingMaps.filter((map) => map.rowKey !== rowKey)
      const importType =
        existingMaps.length !== otherMaps.length ? 'upd' : 'cre'
      const newMaps = [
        { ...thisMap, deCocMappings, aocMappings, ouMappings },
        ...otherMaps,
      ]
      await engine.mutate(mappingsMutation('update', newMaps))
      showPass(`Mapping ${importType}ated`)
    } catch (e) {
      showErr('Error saving the current mapping: ' + e)
    } finally {
      setLoading(false)
    }
  }

  const getMaps = async (engine) => {
    const { namespaces } = await engine.query(dsQuery)
    let nameSpaceKeys = []
    if (namespaces.includes(dataStoreKey)) {
      const res = await engine.query(keysQuery)
      nameSpaceKeys = res.nameSpaceKeys
    }
    if (!nameSpaceKeys.includes(mappingsKey)) {
      await engine.mutate(mappingsMutation('create', []))
      return []
    } else {
      const { mappings } = await engine.query(mappingsQuery)
      return mappings
    }
  }

  return (
    <Button
      loading={loading}
      className="saveButton"
      onClick={handleSave}
      primary
    >
      Save mapping
    </Button>
  )
}

SaveMapping.propTypes = {
  mapConfig: mapConfigType,
  deCocMappings: PropTypes.array,
  aocMappings: PropTypes.array,
  ouMappings: PropTypes.array,
}

export default SaveMapping
