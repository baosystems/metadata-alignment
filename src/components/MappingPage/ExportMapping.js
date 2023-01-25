import React from 'react'
import PropTypes from 'prop-types'
import {
  aocCsvExportHeaders as aocHeader,
  ouCsvExportHeaders as ouHeader,
  tableTypes,
} from './MappingConsts'
import { mapConfigType } from './sharedPropTypes'
import { useAlert } from '@dhis2/app-runtime'
import { Button } from '@dhis2/ui'
import {
  getExportMappingData,
  getExportMappingDataDeCoc,
  getMapInfo,
} from '../../utils/mappingUtils'
import './MappingPage.css'
import { IconDownload24 } from '@dhis2/ui-icons'

/**
 * Download an array of arrays as a csv file with the specified file name
 * @param {Array} csvData Array of rows
 * @param {String} downloadElId Id of DOM element to use as automatic download link
 * @param {String} fileName File name to give the automaticaly downloaded file
 */
export function saveAsCsv(csvData, downloadElId, fileName) {
  const csvContent = csvData.map((e) => `"${e.join('","')}"`).join('\n')
  const file = new Blob([csvContent], { type: 'data:text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(file)
  const link = document.getElementById(downloadElId)
  link.href = url
  link.download = fileName
  link.click()
}

const ExportMapping = ({
  mapConfig,
  deCocMappings: deCocs,
  aocMappings: aocs,
  ouMappings: ous,
}) => {
  const { show: showError } = useAlert((msg) => msg, { critical: true })

  const exportMapping = () => {
    const sourceDs = getMapInfo(mapConfig.sourceDs)
    const targetDs = getMapInfo(mapConfig.targetDs)
    const infoHeader = [
      '',
      '',
      '',
      '',
      'Source Ds',
      sourceDs.names.join(','),
      'target Ds',
      targetDs.names.join(','),
      'Source url',
      mapConfig.sourceUrl,
      'Target url',
      mapConfig.targetUrl,
    ]
    const { AOC, OU } = tableTypes

    generateDeCocExport(infoHeader, deCocs, showError)
    generateExport(infoHeader, ouHeader, ous, OU, showError)
    generateExport(infoHeader, aocHeader, aocs, AOC, showError)
  }

  return (
    <div className="exportButton">
      <Button primary onClick={exportMapping} icon={<IconDownload24 />}>
        Download
      </Button>
      <a id="download-link" className="hidden"></a>
    </div>
  )
}

function generateDeCocExport(mapInfoArr, deCocMappings, showError) {
  try {
    const result = getExportMappingDataDeCoc(deCocMappings, mapInfoArr)
    saveAsCsv(result, 'download-link', 'de_coc_mapping.csv')
  } catch (error) {
    showError(error.message)
  }
}

function generateExport(mapInfoArr, headers, mappings, tableType, showError) {
  try {
    const extraHeader = mapInfoArr.slice(2)
    const result = getExportMappingData(
      headers,
      mappings,
      tableType,
      extraHeader
    )

    saveAsCsv(result, 'download-link', `${tableType}_mapping.csv`)
  } catch (error) {
    showError(error.message)
  }
}

ExportMapping.propTypes = {
  mapConfig: mapConfigType,
  deCocMappings: PropTypes.array,
  aocMappings: PropTypes.array,
  ouMappings: PropTypes.array,
}

export default ExportMapping
