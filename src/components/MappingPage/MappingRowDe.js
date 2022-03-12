import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { idNameArray } from './sharedPropTypes'
import { DataTableRow, DataTableCell } from '@dhis2/ui'
import MappingSelect from './MappingSelect'
import MappingTable from './MappingTable'
import { getCocs } from '../../utils/mappingUtils'
import { tableTypes } from './MappingConsts'

const MappingRowDe = ({ rowId, stateControl, options }) => {
  console.log('stateControl: ', stateControl)
  const [showSubMaps, setShowSubMaps] = useState(false)
  const { mapping, setMapping, deCocMap } = stateControl
  console.log('mapping.sourceDes: ', mapping.sourceDes)
  const { sourceOpts, targetOpts } = options
  const srcCount = mapping?.sourceDes?.length || 0
  const tgtCount = mapping?.targetDes?.length || 0
  const sourceAndTarget = srcCount > 0 && tgtCount > 0
  let expandableContent
  if (sourceAndTarget) {
    const cocMappings = mapping.cocMappings
    const setCocMappings = setMapping.cocSetters
    const cocTableState = {
      mappings: cocMappings,
      setMappings: setCocMappings,
      deCocMap,
    }
    const sourceCocs = getCocs(mapping.sourceDes, deCocMap)
    const targetCocs = getCocs(mapping.targetDes, deCocMap)
    expandableContent = (
      <MappingTable
        sourceOpts={sourceCocs}
        targetOpts={targetCocs}
        tableState={cocTableState}
        tableType={tableTypes.COC}
      />
    )
  } else {
    expandableContent =
      'Please select at least one source and target DE to see CO mappings'
  }

  return (
    <DataTableRow
      key={`${rowId}-row`}
      expanded={showSubMaps}
      onExpandToggle={() => setShowSubMaps(!showSubMaps)}
      expandableContent={expandableContent}
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
      cocMappings: PropTypes.arrayOf(
        PropTypes.shape({
          sourceCocs: PropTypes.arrayOf(PropTypes.string),
          targetCocs: PropTypes.arrayOf(PropTypes.string),
        })
      ).isRequired,
    }).isRequired,
    setMapping: PropTypes.shape({
      sourceDes: PropTypes.func,
      targetDes: PropTypes.func,
      cocSetters: PropTypes.arrayOf(
        PropTypes.shape({
          sourceCocs: PropTypes.func,
          targetCocs: PropTypes.func,
        })
      ).isRequired,
    }).isRequired,
    deCocMap: PropTypes.object,
  }).isRequired,
  options: PropTypes.shape({
    sourceOpts: idNameArray.isRequired,
    targetOpts: idNameArray.isRequired,
  }).isRequired,
}

export default MappingRowDe
