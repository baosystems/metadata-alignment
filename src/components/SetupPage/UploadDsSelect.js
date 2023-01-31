import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { dsInfoFields } from './SetupPageQueries'
import { useAlert } from '@dhis2/app-runtime'
import UrlInput from './UrlInput'
import UploadRadios, { uploadSections } from './UploadRadios'
import {
  Button,
  FileInput,
  MultiSelectField,
  MultiSelectOption,
} from '@dhis2/ui'

const UploadDsSelect = ({
  selectedDs,
  setSelectedDs,
  config,
  setConfig,
  previousSelectedDsIds,
}) => {
  const [dsOptions, setDsOptions] = useState(null)
  const [uploadSection, setUploadSection] = useState(uploadSections.DOWNLOAD)
  const [validUrl, setValidUrl] = useState(true)
  const { show: showError } = useAlert((msg) => msg, { type: 'critical' })
  const { baseUrl: targetUrl } = config

  const setUrl = (value) => {
    setConfig({ ...config, baseUrl: value })
  }

  const openUrl = () => {
    window.open(
      `${targetUrl}/api/dataSets.json?fields=${dsInfoFields}&paging=false`,
      '_blank'
    )
    setUploadSection(uploadSections.UPLOAD)
  }

  const handleUpload = (inputFile) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      try {
        const fileData = JSON.parse(e.target.result)
        if (fileData?.dataSets && fileData.dataSets.length) {
          const href = fileData.dataSets[0].href
          const baseUrl = href.replace(/\/api\/dataSets\/.+/, '')
          if (baseUrl !== targetUrl) {
            console.warn('targetUrl not set, updating from data set file')
            setConfig({ ...config, baseUrl })
          }
          setDsOptions(fileData.dataSets)
          if (previousSelectedDsIds) {
            getFullDs(previousSelectedDsIds, fileData.dataSets)
          }
        } else {
          showError('No data sets found in file')
        }
      } catch (e) {
        showError('Error loading file')
      }
    }
    if (inputFile?.files && inputFile.files.length) {
      reader.readAsText(inputFile.files[0])
    } else {
      showError('Error loading file')
    }
  }

  const getFullDs = (requestedIds, optionsIn) => {
    const options = optionsIn || dsOptions
    setSelectedDs(options.filter(({ id }) => requestedIds.includes(id)))
  }

  if (dsOptions) {
    return (
      <MultiSelectField
        label="Select data sets"
        onChange={(e) => getFullDs(e.selected)}
        selected={selectedDs.map(({ id }) => id)}
        clearable
        filterable
      >
        {dsOptions.map(({ id, name }) => (
          <MultiSelectOption label={name} key={id} value={id} />
        ))}
      </MultiSelectField>
    )
  }

  return (
    <div className="uploadDsSelect">
      <UploadRadios
        uploadSection={uploadSection}
        setUploadSection={setUploadSection}
      />
      {uploadSection === uploadSections.DOWNLOAD && (
        <div className="manualDownload">
          <UrlInput
            label="External server url"
            value={targetUrl}
            onChange={setUrl}
            validUrl={validUrl}
            setValidUrl={setValidUrl}
          />
          <Button
            primary
            disabled={!validUrl || targetUrl === 'https://'}
            onClick={openUrl}
          >
            Go to data page
          </Button>
        </div>
      )}
      {uploadSection === uploadSections.UPLOAD && (
        <FileInput
          inputWidth="900px"
          buttonLabel="Upload data set data"
          onChange={handleUpload}
        />
      )}
    </div>
  )
}

UploadDsSelect.propTypes = {
  selectedDs: PropTypes.array.isRequired,
  setSelectedDs: PropTypes.func.isRequired,
  config: PropTypes.shape({
    dsLocation: PropTypes.string.isRequired,
    baseUrl: PropTypes.string,
  }).isRequired,
  setConfig: PropTypes.func.isRequired,
  previousSelectedDsIds: PropTypes.arrayOf(PropTypes.string),
}

export default UploadDsSelect
