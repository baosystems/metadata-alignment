import React from 'react'
import PropTypes from 'prop-types'
import { idNameArray } from './sharedPropTypes'
import { MultiSelectField, MultiSelectOption } from '@dhis2/ui'
import './MappingPage.css'

const MappingSelect = ({ rowId, selected, onChange, options }) => {
  // Sometimes, it happens that the `selected` option(s)
  // may not exist in `options`. This causes the `MultiSelectField`
  // to throw an error. The following ensures that only selected
  // values existing in `options` are in passed to `MultiSelectField`.
  let validSelections = []
  for (const opt of options) {
    if (selected.includes(opt.id)) validSelections.push(opt.id)
  }

  return (
      <MultiSelectField
          className="mappingMultiSelect"
          selected={validSelections}
          onChange={(e) => onChange(e)}
          clearable
          filterable
      >
        {options.map(({name, id}) => (
            <MultiSelectOption label={name} value={id} key={`${rowId}-${id}-row`}/>
        ))}
      </MultiSelectField>
  )
}

MappingSelect.propTypes = {
  rowId: PropTypes.string.isRequired,
  selected: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  options: idNameArray.isRequired,
}

export default MappingSelect
