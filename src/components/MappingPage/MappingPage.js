import React, { useState } from 'react'
import MappingTable from './MappingTable'
import { flattenDataSets } from '../../utils/mappingUtils'
import { dsPropType, tableTypes } from './MappingConsts'
import { MappingContext, useMappingState } from '../../mappingContext'
import { InputField } from '@dhis2/ui'

const MappingPage = ({ sourceDs, targetDs }) => {
  const sourceDes = flattenDataSets(sourceDs)
  const targetDes = flattenDataSets(targetDs)
  const mappingState = useMappingState(sourceDes, targetDes)
  const [matchThreshold, setMatchThreshold] = useState(0.5)
  return (
    <div className="mappingPage">
      <h1>Configure Data set mapping</h1>
      <InputField
        label="Match threshold"
        name="matchThreshold"
        value={matchThreshold}
        onChange={(e) => setMatchThreshold(e.value)}
        inputWidth="50px"
        helpText="Value between 0 and 1 to autofill mappings, lower values match more strictly"
      />
      <MappingContext.Provider value={mappingState}>
        <MappingTable
          sourceOpts={sourceDes}
          tableState={mappingState}
          tableType={tableTypes.DE}
          matchThreshold={matchThreshold}
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
