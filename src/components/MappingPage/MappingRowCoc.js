import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { idNameArray } from './sharedPropTypes'
import { DataTableRow, DataTableCell } from '@dhis2/ui'
import MappingSelect from './MappingSelect'

const MappingRowCoc = ({ rowId, stateControl, options, matchThreshold }) => {
  const { mapping, setMapping } = stateControl
  const { sourceOpts, rankedTgtOpts } = options
  console.log('Row props: ', rowId, stateControl, options, matchThreshold)
  // Make suggestions on first render
  useEffect(() => {
    console.log('Initial mapping...')
    const bestMatch = rankedTgtOpts[0]
    if (bestMatch.score < matchThreshold) {
      setMapping.targetCocs([bestMatch.id])
    }
  }, [])

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
}

export default MappingRowCoc
