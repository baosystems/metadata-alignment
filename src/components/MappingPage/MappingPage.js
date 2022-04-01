import React, { useState } from 'react'
import MappingTable from './MappingTable'
import { flattenDataSets } from '../../utils/mappingUtils'
import { dsPropType, tableTypes } from './MappingConsts'
import { MappingContext, useMappingState } from '../../mappingContext'
import ThresholdInput from './ThresholdInput'

const MappingPage = ({ sourceDs, targetDs }) => {
  const sourceDes = flattenDataSets(sourceDs)
  const targetDes = flattenDataSets(targetDs)
  const mappingState = useMappingState(sourceDes, targetDes)
  const [matchThreshold, setMatchThreshold] = useState(0.5)
  return (
    <div className="mappingPage">
      <h1>Configure Data set mapping</h1>
      <ThresholdInput
        extMatchThresh={matchThreshold}
        extSetMatchThresh={setMatchThreshold}
      />
      <MappingContext.Provider value={mappingState}>
        <MappingTable
          sourceOpts={sourceDes}
          targetOpts={targetDes}
          tableState={mappingState}
          tableType={tableTypes.DE}
          matchThreshold={Number(matchThreshold)}
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
