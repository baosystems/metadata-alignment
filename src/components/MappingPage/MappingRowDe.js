import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { idNameArray } from './sharedPropTypes'
import { DataTableRow, DataTableCell } from '@dhis2/ui'
// import MappingTable from './MappingTable'
import MappingSelect from './MappingSelect'

const MappingRowDe = ({ rowId, stateControl, options }) => {
  console.log('stateControl: ', stateControl)
  const [showSubMaps, setShowSubMaps] = useState(false)
  const { mapping, setMapping } = stateControl
  console.log('mapping.sourceDes: ', mapping.sourceDes)
  const { sourceOpts, targetOpts } = options

  return (
    <DataTableRow
      key={`${rowId}-row`}
      expanded={showSubMaps}
      onExpandToggle={() => setShowSubMaps(!showSubMaps)}
      expandableContent={'No mappings'}
    >
      <DataTableCell>
        <MappingSelect
          rowId={rowId}
          selected={mapping.sourceDes}
          onChange={(e) => setMapping.sourceDes(e.selected)}
          options={sourceOpts}
        />
      </DataTableCell>
      <DataTableCell>
        <MappingSelect
          rowId={rowId}
          selected={mapping.targetDes}
          onChange={(e) => setMapping.targetDes(e.selected)}
          options={targetOpts}
        />
      </DataTableCell>
    </DataTableRow>
  )
}

MappingRowDe.propTypes = {
  rowId: PropTypes.string.isRequired,
  stateControl: PropTypes.shape({
    mapping: PropTypes.shape({
      sourceDes: PropTypes.arrayOf(PropTypes.string),
      targetDes: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    setMapping: PropTypes.shape({
      sourceDes: PropTypes.func,
      targetDes: PropTypes.func,
    }).isRequired,
  }).isRequired,
  options: PropTypes.shape({
    sourceOpts: idNameArray.isRequired,
    targetOpts: idNameArray.isRequired,
  }).isRequired,
}

export default MappingRowDe
