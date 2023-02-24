import React from 'react'
import PropTypes from 'prop-types'
import { Button, Pagination } from '@dhis2/ui'
import './MappingPage.css'
import { tableTypes } from './MappingConsts'

const TableControls = ({ tableType, addRow, ...paginationProps }) => {
  return (
    <>
      <Pagination
        {...paginationProps}
        pageSizes={['5', '10', '25', '50', '75', '100', '150', '200']}
        className="dataTablePager"
      />
      <div className="tableActions">
        <Button primary small onClick={addRow}>
          Add {tableType} row
        </Button>
      </div>
    </>
  )
}

TableControls.propTypes = {
  tableType: PropTypes.oneOf(Object.values(tableTypes)),
  addRow: PropTypes.func,
  removeEmptyRows: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  pageCount: PropTypes.number,
  total: PropTypes.number,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
}

export default TableControls
