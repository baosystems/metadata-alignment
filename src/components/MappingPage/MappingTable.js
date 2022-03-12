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

const MappingTable = ({ sourceOpts, targetOpts, tableState, tableType }) => {
  const { mappings, setMappings, deCocMap } = tableState
  if (tableType === tableTypes.COC) {
    console.log('Rendering COC mapping table')
    console.log('Source opts: ', sourceOpts)
    console.log('Target opts: ', targetOpts)
    console.log('Table state: ', tableState)
  }
  const hasSubMaps = [tableTypes.DE].includes(tableType)
  const options = { sourceOpts, targetOpts }
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
            options: options,
          }
          switch (tableType) {
            case tableTypes.DE:
              return <MappingRowDe {...rowProps} />
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
  targetOpts: idNameArray.isRequired,
  tableState: PropTypes.shape({
    mappings: PropTypes.array,
    setMappings: PropTypes.array,
    deCocMap: PropTypes.object,
  }),
  tableType: PropTypes.oneOf(Object.values(tableTypes)),
}

export default MappingTable
