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
import usePager from '../../hooks/usePager'
import './MappingPage.css'
import { tableTypeKeys, tableTypes } from './MappingConsts'
import { idNameArray } from './sharedPropTypes'
import MappingRowCoc from './MappingRowCoc'
import { getUniqueOpts } from '../../utils/mappingUtils'
import TableControls from './TableControls'

const MappingTable = ({
  sourceOpts,
  targetOpts,
  mappings,
  setMappings,
  addRow,
  removeRow,
  suggestions,
  deCocMap,
  urlParams,
  tableType,
  matchThreshold,
  makeInitialSuggestions,
}) => {
  const { pageData, page, pageSize, ...pagerProps } = usePager(mappings)
  const pageOffset = (page - 1) * pageSize
  const { sourceKey, targetKey } = tableTypeKeys[tableType]
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
      <TableControls
        tableType={tableType}
        page={page}
        addRow={addRow[tableType]}
        pageSize={pageSize}
        {...pagerProps}
        pageSizes={['5', '10', '25', '50', '75', '100', '150', '200']}
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
            <DataTableColumnHeader></DataTableColumnHeader>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {pageData.map((rowMapping, idx) => {
            const sourceIds = rowMapping?.[sourceKey].join('-')
            const targetIds = rowMapping?.[targetKey].join('-')
            const id = `${[...sourceIds, ...targetIds].join('_')}${idx}`
            const rankedTgtOpts = suggestions
              ? rankOpts(uniqueTgtOpts, suggestions[id])
              : uniqueTgtOpts
            const rowProps = {
              key: id,
              rowId: id,
              removeRow: () => removeRow[tableType](idx),
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
                    addCocRow={{
                      [tableTypes.COC]: () => addRow[tableTypes.COC](idx),
                    }}
                    removeCocRow={{
                      [tableTypes.COC]: (cocIdx) =>
                        removeRow[tableTypes.COC](idx, cocIdx),
                    }}
                    deIdx={pageOffset + idx}
                  />
                )
              case tableTypes.COC:
                return <MappingRowCoc {...rowProps} variant={tableTypes.COC} />
              case tableTypes.AOC:
                return <MappingRowCoc {...rowProps} variant={tableTypes.AOC} />
              case tableTypes.OU:
                return <MappingRowCoc {...rowProps} variant={tableTypes.OU} />
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
  addRow: PropTypes.objectOf(PropTypes.func),
  removeRow: PropTypes.objectOf(PropTypes.func),
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
