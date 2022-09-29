import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { idNameArray } from './sharedPropTypes'
import { DataTableRow, DataTableCell } from '@dhis2/ui'
import MappingSelect from './MappingSelect'
import { autoFill, getSourceNames } from '../../utils/mappingUtils'
import { tableTypeKeys } from './MappingConsts'

const MappingRowCoc = ({
  rowId,
  stateControl,
  options,
  matchThreshold,
  makeInitialSuggestions,
  variant,
}) => {
  const [firstRender, setFirstRender] = useState(true)
  const { mapping, setMapping } = stateControl
  const { sourceOpts, rankedTgtOpts } = options

  const { sourceKey } = tableTypeKeys[variant]
  const { targetKey } = tableTypeKeys[variant]

  // Make suggestions on first render
  useEffect(() => {
    if (makeInitialSuggestions || (!makeInitialSuggestions && !firstRender)) {
      const suggestedMapping = autoFill({
        rankedTgtOpts,
        matchThreshold,
        sourceItems: getSourceNames(sourceOpts, mapping[sourceKey]),
      })
      if (suggestedMapping.length > 0) {
        setMapping[targetKey](suggestedMapping)
      }
    }
  }, [matchThreshold])

  useEffect(() => {
    setFirstRender(false)
  }, [])

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
    rankedTgtOpts: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        score: PropTypes.number.isRequired,
      })
    ),
  }).isRequired,
  matchThreshold: PropTypes.number.isRequired,
  makeInitialSuggestions: PropTypes.bool,
  variant: PropTypes.string.isRequired,
}

export default MappingRowCoc
