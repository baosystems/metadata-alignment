import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useAlert } from '@dhis2/app-runtime'
import { formatParams } from '../../utils/apiUtils'
import {
  MultiSelectField,
  MultiSelectOption,
  InputField,
  Button,
} from '@dhis2/ui'

const ExternalServerDsSelect = ({ selectedDs, setSelectedDs }) => {
  const [serverUrl, setServerUrl] = useState('')
  const [paToken, setPaToken] = useState('')
  const [dsOptions, setDsOptions] = useState(null)
  const { show } = useAlert(`Error connecting to ${serverUrl}`, {
    critical: true,
  })

  const connect = async () => {
    const params = { fields: 'id,displayName~rename(name)', paging: 'false' }
    try {
      const req = await fetch(
        `${serverUrl}/api/dataSets?${formatParams(params)}`,
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
        value={serverUrl}
        onChange={(e) => setServerUrl(e.value)}
      />
      <InputField
        label="Personal access token (not password)"
        value={paToken}
        onChange={(e) => setPaToken(e.value)}
      />
      <Button primary onClick={connect}>
        Connect
      </Button>
    </div>
  )
}

ExternalServerDsSelect.propTypes = {
  selectedDs: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedDs: PropTypes.func.isRequired,
}

export default ExternalServerDsSelect
