import React from 'react'
import PropTypes from 'prop-types'
import { idNameArray } from './sharedPropTypes'
import { MultiSelectField, MultiSelectOption } from '@dhis2/ui'
import './MappingPage.css'

const MappingSelect = ({ rowId, selected, onChange, options }) => (
  <MultiSelectField
    className="mappingMultiSelect"
    selected={selected}
    onChange={(e) => onChange(e)}
    clearable
    filterable
  >
    {options.map(({ name, id }) => (
      <MultiSelectOption label={name} value={id} key={`${rowId}-${id}-row`} />
    ))}
  </MultiSelectField>
)

MappingSelect.propTypes = {
  rowId: PropTypes.string.isRequired,
  selected: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  options: idNameArray.isRequired,
}

export default MappingSelect
