import React from 'react'
import PropTypes from 'prop-types'
import { useDataQuery } from '@dhis2/app-runtime'
import { MultiSelectField, MultiSelectOption } from '@dhis2/ui'
import { allDsQuery } from './SetupPageQueries'

const CurrentServerDsSelect = ({ selectedDs, setSelectedDs }) => {
  const { loading, error, data } = useDataQuery(allDsQuery)

  return (
    <MultiSelectField
      label="Select data sets"
      onChange={(e) => setSelectedDs(e.selected)}
      selected={selectedDs}
      loading={loading}
      loadingText="Loading data sets"
      error={error}
      validationText={error ? 'Error loading data sets' : ''}
      clearable
      filterable
    >
      {data?.allDataSets?.dataSets &&
        data.allDataSets.dataSets.map(({ id, name }) => (
          <MultiSelectOption label={name} key={id} value={id} />
        ))}
    </MultiSelectField>
  )
}

CurrentServerDsSelect.propTypes = {
  selectedDs: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedDs: PropTypes.func.isRequired,
}

export default CurrentServerDsSelect
