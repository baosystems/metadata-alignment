import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import { formatParams, savePat } from '../../utils/apiUtils'
import UrlInput from './UrlInput'
import {
  MultiSelectField,
  MultiSelectOption,
  InputField,
  Button,
} from '@dhis2/ui'

const PatDsSelect = ({
  selectedDs,
  setSelectedDs,
  config,
  fixedUrl,
  setConfig,
  previousSelectedDsIds,
  onCancel,
}) => {
  const { baseUrl: targetUrl } = config
  const [paToken, setPaToken] = useState('')
  const [loading, setLoading] = useState(false)
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
  }

  const setPat = (value) => {
    setPatTouched(true)
    setPaToken(value)
    setValidPat(value.match(/d2pat_[a-zA-Z0-9]{42}/))
  }

  const connect = async () => {
    setLoading(true)
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
        await savePat(engine, targetUrl, paToken)
        setDsOptions(res.dataSets)
        if (previousSelectedDsIds) {
          setSelectedDs(previousSelectedDsIds)
        }
        setPaToken(null)
      } else {
        show()
      }
    } catch (e) {
      show()
    } finally {
      setLoading(false)
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
      <UrlInput
        label="External server url"
        value={targetUrl}
        disabled={fixedUrl}
        onChange={setUrl}
        validUrl={validUrl}
        setValidUrl={setValidUrl}
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
      <div className="patActions">
        <Button
          loading={loading}
          primary
          onClick={connect}
          disabled={!validPat || !validUrl}
        >
          Connect
        </Button>
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
      </div>
    </div>
  )
}

PatDsSelect.propTypes = {
  selectedDs: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedDs: PropTypes.func.isRequired,
  fixedUrl: PropTypes.bool,
  config: PropTypes.shape({
    dsLocation: PropTypes.string.isRequired,
    baseUrl: PropTypes.string,
  }).isRequired,
  setConfig: PropTypes.func.isRequired,
  previousSelectedDsIds: PropTypes.arrayOf(PropTypes.string),
  onCancel: PropTypes.func,
}

export default PatDsSelect
