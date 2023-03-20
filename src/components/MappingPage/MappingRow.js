import React from 'react'
import PropTypes from 'prop-types'
import { idNameArray } from './sharedPropTypes'
import { DataTableRow, DataTableCell, Button } from '@dhis2/ui'
import MappingSelect from './MappingSelect'
import { tableTypeKeys } from './MappingConsts'

const MappingRow = ({ rowId, removeRow, stateControl, options, variant }) => {
  const { mapping, setMapping } = stateControl
  const { sourceOpts, rankedTgtOpts } = options

  const { sourceKey } = tableTypeKeys[variant]
  const { targetKey } = tableTypeKeys[variant]

  return (
    <DataTableRow key={`${rowId}-row`}>
      <DataTableCell>
        <MappingSelect
          rowId={rowId}
          selected={mapping[sourceKey]}
          onChange={(e) => setMapping[sourceKey](e.selected)}
          options={sourceOpts}
        />
      </DataTableCell>
      <DataTableCell>
        <MappingSelect
          rowId={rowId}
          selected={mapping[targetKey]}
          onChange={(e) => setMapping[targetKey](e.selected)}
          options={rankedTgtOpts}
        />
      </DataTableCell>
      <DataTableCell>
        <Button destructive onClick={removeRow}>
          X
        </Button>
      </DataTableCell>
    </DataTableRow>
  )
}

MappingRow.propTypes = {
  rowId: PropTypes.string.isRequired,
  removeRow: PropTypes.func,
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
    rankedTgtOpts: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        score: PropTypes.number,
      })
    ),
  }).isRequired,
  variant: PropTypes.string.isRequired,
}

export default MappingRow
