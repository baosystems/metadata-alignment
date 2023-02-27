import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { idNameArray } from './sharedPropTypes'
import { DataTableRow, DataTableCell, Button } from '@dhis2/ui'
import MappingSelect from './MappingSelect'
import MappingTable from './MappingTable'
import { autoFill, getCocs, getSourceNames } from '../../utils/mappingUtils'
import { tableTypes } from './MappingConsts'

const MappingRowDe = ({
  rowId,
  removeRow,
  stateControl,
  options,
  rankedSuggestions,
  addCocRow,
  removeCocRow,
  matchThreshold,
  deCocMap,
  makeInitialSuggestions,
}) => {
  const [showSubMaps, setShowSubMaps] = useState(false)
  const [firstRender, setFirstRender] = useState(true)
  const { mapping, setMapping } = stateControl
  const { sourceOpts, rankedTgtOpts } = options
  const srcCount = mapping?.sourceDes?.length || 0
  const tgtCount = mapping?.targetDes?.length || 0
  const sourceAndTarget = srcCount > 0 && tgtCount > 0
  // Make suggestions
  useEffect(() => {
    if (makeInitialSuggestions || (!makeInitialSuggestions && !firstRender)) {
      const suggestedMapping = autoFill({
        rankedTgtOpts,
        matchThreshold,
        sourceItems: getSourceNames(sourceOpts, mapping.sourceDes),
      })
      if (suggestedMapping.length > 0) {
        setMapping.targetDes(suggestedMapping)
        setShowSubMaps(true)
      }
    }
  }, [matchThreshold])

  useEffect(() => {
    setFirstRender(false)
  }, [])

  const handleSourceChange = (selected) => {
    if (selected.length === 0) {
      for (const { sourceCocs } of setMapping.cocSetters) {
        sourceCocs([])
      }
    }
    setMapping.sourceDes(selected)
  }

  const handleTargetChange = (selected) => {
    if (selected.length === 0) {
      for (const { targetCocs } of setMapping.cocSetters) {
        targetCocs([])
      }
    }
    setMapping.targetDes(selected)
  }

  let expandableContent
  if (sourceAndTarget) {
    const cocMappings = mapping.cocMappings
    const setCocMappings = setMapping.cocSetters
    const cocTableState = {
      mappings: cocMappings,
      setMappings: setCocMappings,
      rankedSuggestions,
    }
    const sourceCocs = getCocs(mapping.sourceDes, deCocMap.source)
    const targetCocs = getCocs(mapping.targetDes, deCocMap.target)

    expandableContent = (
      <MappingTable
        sourceOpts={sourceCocs}
        targetOpts={targetCocs}
        mappings={cocTableState.mappings}
        setMappings={cocTableState.setMappings}
        addRow={addCocRow}
        removeRow={removeCocRow}
        suggestions={cocTableState.rankedSuggestions}
        tableType={tableTypes.COC}
        matchThreshold={matchThreshold}
        makeInitialSuggestions={makeInitialSuggestions}
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
          onChange={(e) => handleSourceChange(e.selected)}
          options={sourceOpts}
        />
      </DataTableCell>
      <DataTableCell>
        <MappingSelect
          rowId={rowId}
          selected={mapping.targetDes}
          onChange={(e) => handleTargetChange(e.selected)}
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

MappingRowDe.propTypes = {
  rowId: PropTypes.string.isRequired,
  removeRow: PropTypes.func,
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
  }).isRequired,
  options: PropTypes.shape({
    sourceOpts: idNameArray.isRequired,
    rankedTgtOpts: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        score: PropTypes.number,
      })
    ),
  }).isRequired,
  rankedSuggestions: PropTypes.shape({
    [PropTypes.string]: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        score: PropTypes.number,
      })
    ),
  }),
  addCocRow: PropTypes.objectOf(PropTypes.func),
  removeCocRow: PropTypes.objectOf(PropTypes.func),
  matchThreshold: PropTypes.number.isRequired,
  deCocMap: PropTypes.object,
  makeInitialSuggestions: PropTypes.bool,
}

export default MappingRowDe
