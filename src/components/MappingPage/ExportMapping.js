import React from 'react'
import PropTypes from 'prop-types'
import { csvExportHeaders, dsPropType } from './MappingConsts'
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

const ExportMapping = ({ mapConfig, mappings }) => {
  const { show: showError } = useAlert((msg) => msg, { critical: true })

  const exportMapping = () => {
    const sourceDs = getMapInfo(mapConfig.sourceDs)
    const targetDs = getMapInfo(mapConfig.targetDs)
    const mapInfoArr = [
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
    const result = [mapInfoArr, csvExportHeaders]
    for (const { cocMappings, sourceDes, targetDes } of mappings) {
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
            const mapRow = [deUid, cocUid, targetDes[0], targetCocs[0]]
            if (mapRow.every((v) => Boolean(v))) {
              result.push(mapRow)
            }
          }
        }
      }
    }
    saveAsCsv(result, 'download-link', 'dataSetMapping.csv')
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

ExportMapping.propTypes = {
  mapConfig: PropTypes.shape({
    sourceDs: dsPropType,
    targetDs: dsPropType,
    sourceUrl: PropTypes.string.isRequired,
    targetUrl: PropTypes.string.isRequired,
  }),
  mappings: PropTypes.array,
}

export default ExportMapping
