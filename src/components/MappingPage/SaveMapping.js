import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@dhis2/ui'
import { useDataEngine, useAlert } from '@dhis2/app-runtime'
import { dsPropType, mappingsKey } from './MappingConsts'
import { getRowKey } from '../../utils/dataStoreUtils'
import { dataStoreKey } from '../SetupPage/SetupPageConsts'

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

const SaveMapping = ({ mapConfig, mappings }) => {
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
      const existingMaps = await getMaps(engine)
      const otherMaps = existingMaps.filter((map) => map.rowKey !== rowKey)
      const importType = existingMaps.length != otherMaps.length ? 'upd' : 'cre'
      const newMaps = [{ ...thisMap, mappings }, ...otherMaps]
      await engine.mutate(mappingsMutation('update', newMaps))
      showPass(`Mapping ${importType}ated`)
    } catch (e) {
      showErr('Error saving the current mapping: ' + e)
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
    <Button className="saveButton" onClick={handleSave} primary>
      Save mapping
    </Button>
  )
}

SaveMapping.propTypes = {
  mapConfig: PropTypes.shape({
    sourceDs: dsPropType,
    targetDs: dsPropType,
    sourceUrl: PropTypes.string.isRequired,
    targetUrl: PropTypes.string.isRequired,
  }),
  mappings: PropTypes.array,
}

export default SaveMapping
