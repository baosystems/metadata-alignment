import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@dhis2/ui'
import { useDataEngine, useAlert } from '@dhis2/app-runtime'
import { dsPropType, mappingsKey } from './MappingConsts'
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

function arrMatch(idArr1, idArr2) {
  if (idArr1.length !== idArr2.length) {
    return false
  }
  idArr1.sort()
  idArr2.sort()
  for (let i = 0; i < idArr1.length; i++) {
    if (idArr1[i] != idArr2[i]) {
      return false
    }
  }
  return true
}

function mapsMatch(map1, map2) {
  const srcDSetsMatch = arrMatch(map1.sourceDs.ids, map2.sourceDs.ids)
  const tgtDSetsMatch = arrMatch(map1.targetDs.ids, map2.targetDs.ids)
  const srcUrlMatch = map1.sourceUrl === map2.sourceUrl
  const tgtUrlMatch = map1.targetUrl === map2.targetUrl
  return srcDSetsMatch && tgtDSetsMatch && srcUrlMatch && tgtUrlMatch
}

function getMapInfo(dSets) {
  const result = { ids: [], names: [] }
  for (const ds of dSets) {
    result.ids.push(ds.id)
    result.names.push(ds.name)
  }
  return result
}

const SaveMapping = ({ mapConfig, mappings }) => {
  const engine = useDataEngine()
  const { sourceDs, targetDs, sourceUrl, targetUrl } = mapConfig
  const { show: showErr } = useAlert((msg) => msg, { critical: true })
  const { show: showPass } = useAlert((msg) => msg, { success: true })
  const thisMap = {
    sourceDs: getMapInfo(sourceDs),
    targetDs: getMapInfo(targetDs),
    sourceUrl,
    targetUrl,
  }
  const handleSave = async () => {
    try {
      const existingMaps = await getMaps(engine)
      const otherMaps = existingMaps.filter((map) => !mapsMatch(thisMap, map))
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
    <Button onClick={handleSave} primary>
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
