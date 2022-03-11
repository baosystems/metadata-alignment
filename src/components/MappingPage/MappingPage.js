import React from 'react'
import MappingTable from './MappingTable'
import { mockSourceDs, mockTargetDs } from '../../tests/mockData/mockDataSets'
import { flattenDataSets } from '../../utils/mappingUtils'
import { tableTypes } from './MappingConsts'
import { MappingContext, useMappingState } from '../../mappingContext'

const MappingPage = () => {
  const sourceDes = flattenDataSets(mockSourceDs)
  const targetDes = flattenDataSets(mockTargetDs)
  const mappingState = useMappingState(sourceDes, targetDes)
  return (
    <div>
      <h1>Configure Data set mapping</h1>
      <MappingContext.Provider value={mappingState}>
        <MappingTable
          sourceOpts={sourceDes}
          targetOpts={targetDes}
          tableState={mappingState}
          tableType={tableTypes.DE}
        />
      </MappingContext.Provider>
    </div>
  )
}

export default MappingPage
