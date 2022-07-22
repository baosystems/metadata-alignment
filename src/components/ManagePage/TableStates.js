import React from 'react'
import PropTypes from 'prop-types'
import { DataTableRow, DataTableCell, CircularLoader } from '@dhis2/ui'

const STATES = ['loading', 'error']
const STATES_MAP = {
  LOADING: 'loading',
  ERROR: 'error',
}

const TableState = ({ content, type }) => (
  <DataTableRow>
    <DataTableCell colSpan="5">
      {type === STATES_MAP.LOADING && (
        <>
          <CircularLoader />
          Loading mappings...
        </>
      )}
      {type === STATES_MAP.error && content}
    </DataTableCell>
  </DataTableRow>
)

TableState.propTypes = {
  content: PropTypes.any,
  type: PropTypes.oneOf(STATES),
}

export const TableLoading = () => <TableState type={STATES_MAP.LOADING} />

export const TableError = ({ error }) => (
  <TableState type={STATES_MAP.ERROR} content={error} />
)

TableError.propTypes = {
  error: PropTypes.any,
}
