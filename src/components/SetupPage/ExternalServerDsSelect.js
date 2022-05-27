import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import { formatParams, savePat } from '../../utils/apiUtils'
import {
  MultiSelectField,
  MultiSelectOption,
  InputField,
  Button,
} from '@dhis2/ui'

const ExternalServerDsSelect = ({
  selectedDs,
  setSelectedDs,
  config,
  setConfig,
}) => {
  const { baseUrl: targetUrl } = config
  const [paToken, setPaToken] = useState('')
  const [validUrl, setValidUrl] = useState(true)
  const [validPat, setValidPat] = useState(false)
  const [patTouched, setPatTouched] = useState(false)
  const engine = useDataEngine()
  const [dsOptions, setDsOptions] = useState(null)
  const { show } = useAlert(`Error connecting to ${targetUrl}`, {
    critical: true,
  })

  const setUrl = (value) => {
    setConfig({ ...config, baseUrl: value })
    setValidUrl(value.match(/^https:\/\/.+\..+/))
  }

  const setPat = (value) => {
    setPatTouched(true)
    setPaToken(value)
    setValidPat(value.match(/d2pat_[a-zA-Z0-9]{42}/))
  }

  const connect = async () => {
    const params = { fields: 'id,displayName~rename(name)', paging: 'false' }
    try {
      const req = await fetch(
        `${targetUrl}/api/dataSets?${formatParams(params)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `ApiToken ${paToken}`,
          },
        }
      )
      const res = await req.json()
      if ('dataSets' in res) {
        setDsOptions(res.dataSets)
        savePat(engine, targetUrl, paToken)
        setPaToken(null)
      } else {
        show()
      }
    } catch (e) {
      show()
    }
  }

  if (dsOptions) {
    return (
      <MultiSelectField
        label="Select data sets"
        onChange={(e) => setSelectedDs(e.selected)}
        selected={selectedDs}
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
    <div className="externalConnect">
      <InputField
        label="External server url"
        value={targetUrl}
        placeholder="https://"
        onChange={(e) => setUrl(e.value)}
        error={!validUrl}
        validationText={!validUrl ? 'Invalid url' : ''}
      />
      <InputField
        label="Personal access token (not password)"
        value={paToken}
        type="password"
        placeholder="d2pat_xxx"
        onChange={(e) => setPat(e.value)}
        error={!validPat && patTouched}
        validationText={
          !validPat && patTouched ? 'Please enter a valid PAT' : ''
        }
      />
      <Button primary onClick={connect} disabled={!validPat || !validUrl}>
        Connect
      </Button>
    </div>
  )
}

ExternalServerDsSelect.propTypes = {
  selectedDs: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedDs: PropTypes.func.isRequired,
  config: PropTypes.shape({
    dsLocation: PropTypes.string.isRequired,
    baseUrl: PropTypes.string,
  }).isRequired,
  setConfig: PropTypes.func.isRequired,
}

export default ExternalServerDsSelect
