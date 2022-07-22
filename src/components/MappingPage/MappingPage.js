import React, { useState, useContext } from 'react'
import MappingTable from './MappingTable'
import { flattenDataSets } from '../../utils/mappingUtils'
import { tableTypes } from './MappingConsts'
import { MappingContext, useMappingState } from '../../mappingContext'
import ThresholdInput from './ThresholdInput'
import ExportMapping from './ExportMapping'
import SaveMapping from './SaveMapping'
import { SharedStateContext } from '../../sharedStateContext'

const MappingPage = () => {
  const sharedState = useContext(SharedStateContext)
  const { sourceDs, targetDs, sourceUrl, targetUrl, currentMapping } =
    sharedState
  if (!sourceDs.length > 0 || !targetDs.length > 0) {
    return <p>Please setup or load a mapping via the other pages</p>
  }
  const sourceDes = flattenDataSets(sourceDs)
  const targetDes = flattenDataSets(targetDs)
  const mappingState = useMappingState(sourceDes, targetDes, currentMapping)
  const mapConfig = { sourceDs, targetDs, sourceUrl, targetUrl }
  const [matchThreshold, setMatchThreshold] = useState(0.5)
  return (
    <div className="mappingPage">
      <h1>Configure Data set mapping</h1>
      <div className="tableControls">
        <ThresholdInput
          extMatchThresh={matchThreshold}
          extSetMatchThresh={setMatchThreshold}
        />
        <ExportMapping mapConfig={mapConfig} mappings={mappingState.mappings} />
        <SaveMapping mapConfig={mapConfig} mappings={mappingState.mappings} />
      </div>

      <MappingContext.Provider value={mappingState}>
        <MappingTable
          sourceOpts={sourceDes}
          targetOpts={targetDes}
          urlParams={{ sourceUrl, targetUrl }}
          tableState={mappingState}
          tableType={tableTypes.DE}
          matchThreshold={Number(matchThreshold)}
          makeInitialSuggestions={currentMapping.length === 0}
        />
      </MappingContext.Provider>
    </div>
  )
}

export default MappingPage
