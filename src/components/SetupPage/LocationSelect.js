import React from 'react'
import PropTypes from 'prop-types'
import { Radio } from '@dhis2/ui'

const LocationSelect = ({ dsLocation, setDsLocation }) => {
  return (
    <div className="locationSelect">
      <Radio
        label="Current server"
        name="dsLocation"
        onChange={(e) => setDsLocation(e.value)}
        value="currentServer"
        checked={dsLocation === 'currentServer'}
      />
      <Radio
        label="External server"
        name="dsLocation"
        onChange={(e) => setDsLocation(e.value)}
        value="externalServer"
        checked={dsLocation === 'externalServer'}
      />
    </div>
  )
}

LocationSelect.propTypes = {
  dsLocation: PropTypes.string,
  setDsLocation: PropTypes.func.isRequired,
}

export default LocationSelect
