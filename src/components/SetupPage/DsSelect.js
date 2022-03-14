import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Box, Card } from '@dhis2/ui'
import LocationSelect from './LocationSelect'
import CurrentServerDsSelect from './CurrentServerDsSelect'
import ExternalServerDsSelect from './ExternalServerDsSelect'
import { dsLocations } from './SetupPageConsts'
import './SetupPage.css'

const DsSelect = ({ selectedDs, setSelectedDs, type }) => {
  const [dsLocation, setDsLocation] = useState(null)
  const sharedProps = { selectedDs, setSelectedDs }
  return (
    <Box height="400px" width="500px">
      <Card className="cardContent">
        <h2>Select {type}</h2>
        <p>Select the location of the {type} data sets:</p>
        <LocationSelect dsLocation={dsLocation} setDsLocation={setDsLocation} />
        {dsLocation === dsLocations.currentServer && (
          <CurrentServerDsSelect {...sharedProps} />
        )}
        {dsLocation === dsLocations.externalServer && (
          <ExternalServerDsSelect {...sharedProps} />
        )}
      </Card>
    </Box>
  )
}

DsSelect.propTypes = {
  selectedDs: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedDs: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
}

export default DsSelect
