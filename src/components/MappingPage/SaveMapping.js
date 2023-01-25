import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from '@dhis2/ui'
import { IconSave24 } from '@dhis2/ui-icons'
import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import { saveMapping } from '../../utils/dataStoreUtils'
import { mapConfigType } from './sharedPropTypes'
import { metaTypes } from '../../mappingContext'

const SaveMapping = ({
  mapConfig,
  deCocMappings,
  aocMappings,
  ouMappings,
  mappingPipelines,
}) => {
  const [loading, setLoading] = useState(false)
  const engine = useDataEngine()
  const { show: showErr } = useAlert((msg) => msg, { critical: true })
  const { show: showPass } = useAlert((msg) => msg, { success: true })

  const handleSave = async () => {
    try {
      setLoading(true)
      const mappingState = { deCocMappings, aocMappings, ouMappings }
      await saveMapping(engine, mapConfig, mappingState, mappingPipelines)
      showPass(`Mapping created or updated`)
    } catch (e) {
      showErr('Error saving the current mapping: ' + e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      primary
      onClick={handleSave}
      className="saveButton"
      loading={loading}
      icon={<IconSave24 />}
    >
      Save
    </Button>
  )
}

SaveMapping.propTypes = {
  mapConfig: mapConfigType,
  deCocMappings: PropTypes.array,
  aocMappings: PropTypes.array,
  ouMappings: PropTypes.array,
  mappingPipelines: PropTypes.shape({
    [metaTypes.DE_COC]: PropTypes.string,
    [metaTypes.AOC]: PropTypes.string,
    [metaTypes.OU]: PropTypes.string,
  }),
}

export default SaveMapping
