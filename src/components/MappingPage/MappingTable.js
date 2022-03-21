import React from 'react'
import PropTypes from 'prop-types'
import MappingRowDe from './MappingRowDe'
import {
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableColumnHeader,
  DataTableBody,
} from '@dhis2/ui'
import './MappingPage.css'
import { tableTypes } from './MappingConsts'
import { idNameArray } from './sharedPropTypes'
import MappingRowCoc from './MappingRowCoc'

const MappingTable = ({
  sourceOpts,
  tableState,
  tableType,
  matchThreshold,
}) => {
  const { mappings, setMappings, deCocMap, rankedSuggestions } = tableState
  const hasSubMaps = [tableTypes.DE].includes(tableType)
  const styles = hasSubMaps ? 'withSubMaps' : 'noSubMaps'
  return (
    <DataTable className={`dataTable ${styles}`}>
      <DataTableHead>
        <DataTableRow>
          {hasSubMaps && <DataTableColumnHeader />}
          <DataTableColumnHeader>Source</DataTableColumnHeader>
          <DataTableColumnHeader>Target</DataTableColumnHeader>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        {sourceOpts.map(({ id }, idx) => {
          const rowProps = {
            key: id,
            rowId: id,
            stateControl: {
              mapping: mappings[idx],
              setMapping: setMappings[idx],
              deCocMap,
            },
            options: { sourceOpts, rankedTgtOpts: rankedSuggestions[id] },
            matchThreshold,
          }
          switch (tableType) {
            case tableTypes.DE:
              return (
                <MappingRowDe
                  {...rowProps}
                  rankedSuggestions={rankedSuggestions}
                />
              )
            case tableTypes.COC:
              return <MappingRowCoc {...rowProps} />
            default:
              return <p>No mapping found for table type {tableType}</p>
          }
        })}
      </DataTableBody>
    </DataTable>
  )
}

MappingTable.propTypes = {
  sourceOpts: idNameArray.isRequired,
  tableState: PropTypes.shape({
    mappings: PropTypes.array,
    setMappings: PropTypes.array,
    deCocMap: PropTypes.object,
    rankedSuggestions: PropTypes.shape({
      [PropTypes.string]: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          score: PropTypes.number.isRequired,
        })
      ),
    }),
  }),
  tableType: PropTypes.oneOf(Object.values(tableTypes)),
  matchThreshold: PropTypes.number.isRequired,
}

export default MappingTable
