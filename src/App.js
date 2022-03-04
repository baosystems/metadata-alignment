import React from 'react'
import { mockSourceDs, mockTargetDs } from './tests/mockData/mockDataSets'
import useSelects from './hooks/useSelects'
import {
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableColumnHeader,
  DataTableBody,
  DataTableCell,
  MultiSelectField,
  MultiSelectOption,
} from '@dhis2/ui'
import classes from './App.module.css'
import { flattenDataSets } from './utils/mappingUtils'

const App = () => {
  const sourceDes = flattenDataSets(mockSourceDs)
  const targetDes = flattenDataSets(mockTargetDs)
  const sourceDeIds = sourceDes.map(({ id }) => id)
  const initSource = sourceDeIds.reduce(
    (acc, deId) => ({ ...acc, [deId]: [deId] }),
    {}
  )
  const initTarget = sourceDeIds.reduce(
    (acc, deId) => ({ ...acc, [deId]: [] }),
    {}
  )
  const [deSources, setSources] = useSelects(initSource)
  const [deTargets, setTargets] = useSelects(initTarget)
  return (
    <div className={classes.container}>
      <DataTable className={classes.dataTable}>
        <DataTableHead>
          <DataTableRow>
            <DataTableColumnHeader>Source</DataTableColumnHeader>
            <DataTableColumnHeader>Target</DataTableColumnHeader>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {sourceDes.map(({ id: rowSourceDeId }) => (
            <DataTableRow key={`${rowSourceDeId}-row`}>
              <DataTableCell>
                <MultiSelectField
                  selected={deSources[rowSourceDeId]}
                  onChange={(e) => setSources[rowSourceDeId](e.selected)}
                  key={`${rowSourceDeId}-source-select`}
                >
                  {sourceDes.map(({ name: sourceDeName, id: sourceDeId }) => (
                    <MultiSelectOption
                      label={sourceDeName}
                      value={sourceDeId}
                      key={`${rowSourceDeId}-${sourceDeId}-row`}
                    />
                  ))}
                </MultiSelectField>
              </DataTableCell>
              <DataTableCell>
                <MultiSelectField
                  selected={deTargets[rowSourceDeId]}
                  onChange={(e) => setTargets[rowSourceDeId](e.selected)}
                  key={`${rowSourceDeId}-target-select`}
                >
                  {targetDes.map(({ name: targetDeName, id: targetDeId }) => (
                    <MultiSelectOption
                      label={targetDeName}
                      value={targetDeId}
                      key={`${targetDeId}-${targetDeId}-row`}
                    />
                  ))}
                </MultiSelectField>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  )
}

export default App
