import React from 'react'
import PropTypes from 'prop-types'
import MappingRowDe from './MappingRowDe'
import {
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableColumnHeader,
  DataTableBody,
  Pagination,
} from '@dhis2/ui'
import usePager from '../../hooks/usePager'
import './MappingPage.css'
import { tableTypes } from './MappingConsts'
import { idNameArray } from './sharedPropTypes'
import MappingRowCoc from './MappingRowCoc'
import { getUniqueOpts } from '../../utils/mappingUtils'

const MappingTable = ({
  sourceOpts,
  targetOpts,
  mappings,
  setMappings,
  suggestions,
  deCocMap,
  urlParams,
  tableType,
  matchThreshold,
  makeInitialSuggestions,
}) => {
  const { pageData, page, pageSize, ...pagerProps } = usePager(mappings)
  const pageOffset = (page - 1) * pageSize
  const uniqueSrcOpts = getUniqueOpts(sourceOpts)
  const uniqueTgtOpts = getUniqueOpts(targetOpts)
  const hasSubMaps = [tableTypes.DE].includes(tableType)
  const styles = hasSubMaps ? 'withSubMaps' : 'noSubMaps'
  const rankOpts = (tgtOpts, allOptsRanked) => {
    const tgtOptIds = tgtOpts.map(({ id }) => id)
    if (!allOptsRanked) {
      return tgtOpts
    }
    const result = allOptsRanked.filter(({ id }) => tgtOptIds.includes(id))
    if (result.length < tgtOpts.length) {
      result.forEach(({ id }) => {
        tgtOpts = tgtOpts.filter(({ id: tgtId }) => tgtId !== id)
      })
      result.push(...tgtOpts)
    }

    return result
  }

  return (
    <div>
      <Pagination
        page={page}
        pageSize={pageSize}
        {...pagerProps}
        className="dataTablePager"
      />
      <DataTable className={`dataTable ${styles}`}>
        <DataTableHead>
          <DataTableRow>
            {hasSubMaps && <DataTableColumnHeader />}
            <DataTableColumnHeader>
              Source
              {[tableTypes.DE, tableTypes.AOC].includes(tableType) &&
                ` (${urlParams.sourceUrl})`}
            </DataTableColumnHeader>
            <DataTableColumnHeader>
              Target
              {[tableTypes.DE, tableTypes.AOC].includes(tableType) &&
                ` (${urlParams.targetUrl})`}
            </DataTableColumnHeader>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {pageData.map((rowMapping, idx) => {
            const id = rowMapping.sourceDes?.[0]
            const rankedTgtOpts = rankOpts(uniqueTgtOpts, suggestions[id])
            const rowProps = {
              key: id,
              rowId: id,
              stateControl: {
                mapping: pageData[idx],
                setMapping: setMappings[pageOffset + idx],
              },
              options: { sourceOpts: uniqueSrcOpts, rankedTgtOpts },
              matchThreshold,
              makeInitialSuggestions,
            }
            switch (tableType) {
              case tableTypes.DE:
                return (
                  <MappingRowDe
                    {...rowProps}
                    rankedSuggestions={suggestions}
                    deCocMap={deCocMap}
                  />
                )
              case tableTypes.COC:
                return <MappingRowCoc {...rowProps} variant={tableTypes.COC} />
              case tableTypes.AOC:
                return <MappingRowCoc {...rowProps} variant={tableTypes.AOC} />
              default:
                return <p>No mapping found for table type {tableType}</p>
            }
          })}
        </DataTableBody>
      </DataTable>
    </div>
  )
}

MappingTable.propTypes = {
  sourceOpts: idNameArray.isRequired,
  targetOpts: idNameArray.isRequired,
  mappings: PropTypes.array,
  setMappings: PropTypes.array,
  deCocMap: PropTypes.object,
  suggestions: PropTypes.shape({
    [PropTypes.string]: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        score: PropTypes.number.isRequired,
      })
    ),
  }),
  urlParams: PropTypes.shape({
    sourceUrl: PropTypes.string,
    targetUrl: PropTypes.string,
  }),
  tableType: PropTypes.oneOf(Object.values(tableTypes)),
  matchThreshold: PropTypes.number.isRequired,
  makeInitialSuggestions: PropTypes.bool,
}

export default MappingTable
