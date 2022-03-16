import React from 'react'
import MappingTable from './MappingTable'
import { flattenDataSets } from '../../utils/mappingUtils'
import { dsPropType, tableTypes } from './MappingConsts'
import { MappingContext, useMappingState } from '../../mappingContext'

const MappingPage = ({ sourceDs, targetDs }) => {
  const sourceDes = flattenDataSets(sourceDs)
  const targetDes = flattenDataSets(targetDs)
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

MappingPage.propTypes = {
  sourceDs: dsPropType,
  targetDs: dsPropType,
}

export default MappingPage
