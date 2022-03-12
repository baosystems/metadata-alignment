import React from 'react'
import PropTypes from 'prop-types'
import { idNameArray } from './sharedPropTypes'
import { DataTableRow, DataTableCell } from '@dhis2/ui'
import MappingSelect from './MappingSelect'

const MappingRowCoc = ({ rowId, stateControl, options }) => {
  const { mapping, setMapping } = stateControl
  const { sourceOpts, targetOpts } = options

  return (
    <DataTableRow key={`${rowId}-row`}>
      <DataTableCell>
        <MappingSelect
          rowId={rowId}
          selected={mapping.sourceCocs}
          onChange={(e) => setMapping.sourceCocs(e.selected)}
          options={sourceOpts}
        />
      </DataTableCell>
      <DataTableCell>
        <MappingSelect
          rowId={rowId}
          selected={mapping.targetCocs}
          onChange={(e) => setMapping.targetCocs(e.selected)}
          options={targetOpts}
        />
      </DataTableCell>
    </DataTableRow>
  )
}

MappingRowCoc.propTypes = {
  rowId: PropTypes.string.isRequired,
  stateControl: PropTypes.shape({
    mapping: PropTypes.shape({
      sourceCocs: PropTypes.arrayOf(PropTypes.string),
      targetCocs: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    setMapping: PropTypes.shape({
      sourceCocs: PropTypes.func,
      targetCocs: PropTypes.func,
    }).isRequired,
  }).isRequired,
  options: PropTypes.shape({
    sourceOpts: idNameArray.isRequired,
    targetOpts: idNameArray.isRequired,
  }).isRequired,
}

export default MappingRowCoc
