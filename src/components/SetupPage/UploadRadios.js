import React from 'react'
import PropTypes from 'prop-types'
import { Radio } from '@dhis2/ui'

export const uploadSections = {
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
}

const UploadRadios = ({ uploadSection, setUploadSection }) => {
  return (
    <div className="radioItems">
      <Radio
        label="Download new"
        name="uploadradios"
        onChange={(e) => setUploadSection(e.value)}
        value={uploadSections.DOWNLOAD}
        checked={uploadSection === uploadSections.DOWNLOAD}
      />
      <Radio
        label="Upload existing"
        name="uploadradios"
        onChange={(e) => setUploadSection(e.value)}
        value={uploadSections.UPLOAD}
        checked={uploadSection === uploadSections.UPLOAD}
      />
    </div>
  )
}

UploadRadios.propTypes = {
  uploadSection: PropTypes.string,
  setUploadSection: PropTypes.func.isRequired,
}

export default UploadRadios
