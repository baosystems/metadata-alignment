import React from 'react'
import useMappings from './useMappings'
import { TableLoading, TableError } from './TableStates'
import { getRowKey } from '../../utils/dataStoreUtils'
import EditMappingBtn from './EditMappingBtn'
import DeleteMappingBtn from './DeleteMappingBtn'
import './ManagePage.css'
import {
  DataTable,
  DataTableHead,
  DataTableColumnHeader,
  DataTableRow,
  DataTableBody,
  DataTableCell,
} from '@dhis2/ui'

const ManagePage = () => {
  const { loading, error, data, refetch: refresh } = useMappings()
  return (
    <div className="managePage">
      <DataTable>
        <DataTableHead>
          <DataTableRow>
            <DataTableColumnHeader>Source data sets</DataTableColumnHeader>
            <DataTableColumnHeader>Target data sets</DataTableColumnHeader>
            <DataTableColumnHeader>Source server</DataTableColumnHeader>
            <DataTableColumnHeader>Target server</DataTableColumnHeader>
            <DataTableColumnHeader></DataTableColumnHeader>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {loading && <TableLoading />}
          {error && <TableError message={error} />}
          {data &&
            data.map((rowData) => {
              const { sourceDs, targetDs, sourceUrl, targetUrl } = rowData
              const srcDsNames = sourceDs.map((ds) => ds.name).join(', ')
              const tgtDsNames = targetDs.map((ds) => ds.name).join(', ')
              const rowKey = getRowKey(rowData)
              return (
                <DataTableRow key={rowKey}>
                  <DataTableCell>{srcDsNames}</DataTableCell>
                  <DataTableCell>{tgtDsNames}</DataTableCell>
                  <DataTableCell>{sourceUrl}</DataTableCell>
                  <DataTableCell>{targetUrl}</DataTableCell>
                  <DataTableCell>
                    <div className="rowControls">
                      <EditMappingBtn mappingData={rowData} />
                      <DeleteMappingBtn
                        mappingData={rowData}
                        allMaps={data}
                        refresh={refresh}
                      />
                    </div>
                  </DataTableCell>
                </DataTableRow>
              )
            })}
        </DataTableBody>
      </DataTable>
    </div>
  )
}

export default ManagePage
