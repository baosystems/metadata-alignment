import React from 'react'
import PropTypes from 'prop-types'
import { Box, Card } from '@dhis2/ui'
import LocationSelect from './LocationSelect'
import CurrentServerDsSelect from './CurrentServerDsSelect'
import ExternalServerDsSelect from './ExternalServerDsSelect'
import { dsLocations } from './SetupPageConsts'
import './SetupPage.css'

const DsSelect = ({ selectedDs, setSelectedDs, config, setConfig, type }) => {
  const sharedProps = { selectedDs, setSelectedDs }
  const { dsLocation } = config
  return (
    <Box height="400px" width="500px">
      <Card className="cardContent">
        <h2>Select {type}</h2>
        <p>Select the location of the {type} data sets:</p>
        <LocationSelect
          dsLocation={dsLocation}
          setDsLocation={(val) => setConfig({ ...config, dsLocation: val })}
        />
        {dsLocation === dsLocations.currentServer && (
          <CurrentServerDsSelect {...sharedProps} />
        )}
        {dsLocation === dsLocations.externalServer && (
          <ExternalServerDsSelect
            {...sharedProps}
            config={config}
            setConfig={setConfig}
          />
        )}
      </Card>
    </Box>
  )
}

DsSelect.propTypes = {
  selectedDs: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedDs: PropTypes.func.isRequired,
  config: PropTypes.shape({
    dsLocation: PropTypes.string,
    baseUrl: PropTypes.string,
  }).isRequired,
  setConfig: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
}

export default DsSelect
