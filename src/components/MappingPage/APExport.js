import React from 'react'
import PropTypes from 'prop-types'
import { mapConfigType } from './sharedPropTypes'
import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import { Button, Tooltip } from '@dhis2/ui'
import { getFileFromMapping } from '../../utils/mappingUtils'
import './MappingPage.css'
import { createPipeline, getPipelineNameAndDesc } from '../../utils/apiUtils'
import { metaTypes } from '../../mappingContext'
import { saveMapping } from '../../utils/dataStoreUtils'
import { useHistory } from 'react-router-dom'
import { IconPushRight24 } from '@dhis2/ui-icons'

const APExport = ({
  mapConfig,
  deCocMappings,
  aocMappings,
  ouMappings,
  mappingPipelines,
  setMappingPipelines,
}) => {
  const { show: showInfo } = useAlert((msg) => msg, { info: true })
  const { show: showPass } = useAlert((msg) => msg, { success: true })
  const { show: showError } = useAlert((msg) => msg, { critical: true })

  const engine = useDataEngine()
  const history = useHistory()

  const exportMapping = async () => {
    if (!sessionStorage.getItem('auth')) {
      showError('You not signed in to AP. Please sign in first.')
      history.push('/connect')
      return
    }

    showInfo('Exporting mapping to AP 🚀')

    await exportData(
      engine,
      { deCocMappings, aocMappings, ouMappings },
      mappingPipelines,
      setMappingPipelines,
      mapConfig,
      showError
    )

    showPass('Export to AP completed 🎉')
  }

  return (
    <div className="exportButton">
      <Tooltip content="Export Mapping to AP">
        <Button primary onClick={exportMapping} icon={<IconPushRight24 />}>
          Export
        </Button>
      </Tooltip>
    </div>
  )
}

async function exportData(
  engine,
  state,
  pipelines,
  setPipelines,
  config,
  showError
) {
  const nextPipelines = {}
  try {
    for (const metaType of Object.values(metaTypes)) {
      const existingPipelineId = pipelines && pipelines[metaType]
      const { name, description } = getPipelineNameAndDesc(config, metaType)

      const mapping = state[`${metaType}Mappings`]
      const file = getFileFromMapping(mapping, metaType)

      try {
        const pipelineId = await createPipeline(
          file,
          name,
          description,
          existingPipelineId
        )
        nextPipelines[metaType] = pipelineId || existingPipelineId
      } catch (error) {
        showError(`Error creating/updating ${metaType} pipeline`)

        if (existingPipelineId) {
          nextPipelines[metaType] = existingPipelineId
        }
      }
    }

    await saveMapping(engine, config, state, nextPipelines)

    setPipelines(nextPipelines)
  } catch (error) {
    showError(`Error exporting current mapping to AP: ${error.message}`)
  }
}

APExport.propTypes = {
  mapConfig: mapConfigType,
  deCocMappings: PropTypes.array,
  aocMappings: PropTypes.array,
  ouMappings: PropTypes.array,
  mappingPipelines: PropTypes.shape({
    [metaTypes.DE_COC]: PropTypes.string,
    [metaTypes.AOC]: PropTypes.string,
    [metaTypes.OU]: PropTypes.string,
  }),
  setMappingPipelines: PropTypes.func,
}

export default APExport
