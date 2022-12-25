import React from 'react'
import PropTypes from 'prop-types'
import {
  aocCsvExportHeaders as aocHeader,
  deCocCsvExportHeaders as deCocHeader,
  ouCsvExportHeaders as ouHeader,
  tableTypeKeys,
  tableTypes,
} from './MappingConsts'
import { mapConfigType } from './sharedPropTypes'
import { useAlert } from '@dhis2/app-runtime'
import { Button } from '@dhis2/ui'
import { getMapInfo } from '../../utils/mappingUtils'
import './MappingPage.css'

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
      <Button primary onClick={exportMapping}>
        Export
      </Button>
      <a id="download-link" className="hidden"></a>
    </div>
  )
}

function generateDeCocExport(mapInfoArr, deCocMappings, showError) {
  const result = [mapInfoArr, deCocHeader]

  for (const { cocMappings, sourceDes, targetDes } of deCocMappings) {
    if (targetDes.length > 1) {
      showError('Only single target de mappings are currently supported')
      return
    }
    for (const { sourceCocs, targetCocs } of cocMappings) {
      if (targetCocs.length > 1) {
        showError('Only single target coc mappings are currently supported')
        return
      }
      for (const deUid of sourceDes) {
        for (const cocUid of sourceCocs) {
          result.push([deUid, cocUid, targetDes[0], targetCocs[0]])
        }
      }
    }
  }

  saveAsCsv(result, 'download-link', 'de_coc_Mapping.csv')
}

function generateExport(mapInfoArr, headers, mappings, tableType, showError) {
  const result = [mapInfoArr.slice(2), headers]
  const keys = tableTypeKeys[tableType]

  for (const {
    [keys.sourceKey]: source,
    [keys.targetKey]: target,
  } of mappings) {
    if (target.length > 1) {
      showError(
          `Only single target ${tableType} mappings are currently supported`
      )
      return
    }

    for (const ouId of source) {
      result.push([ouId, target[0]])
    }
  }

  saveAsCsv(result, 'download-link', `${tableType}_mapping.csv`)
}

ExportMapping.propTypes = {
  mapConfig: mapConfigType,
  deCocMappings: PropTypes.array,
  aocMappings: PropTypes.array,
  ouMappings: PropTypes.array,
}

export default ExportMapping
