import React from 'react'
import PropTypes from 'prop-types'
import { InputField } from '@dhis2/ui'

const UrlInput = ({ onChange, validUrl, setValidUrl, ...props }) => {
  const handleChange = (value) => {
    setValidUrl(!!value.match(/^http*s:\/\/.+\..+/))
    onChange(value)
  }

  return (
    <InputField
      onChange={(e) => handleChange(e.value)}
      error={!validUrl}
      validationText={!validUrl ? 'Invalid url' : ''}
      placeholder="https://"
      {...props}
    />
  )
}

UrlInput.propTypes = {
  inputValue: PropTypes.string,
  onChange: PropTypes.func,
  validUrl: PropTypes.bool,
  setValidUrl: PropTypes.func,
}

export default UrlInput
