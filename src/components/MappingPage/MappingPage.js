import React, { useState } from 'react'
import PropTypes from 'prop-types'
import MappingTable from './MappingTable'
import { flattenDataSets } from '../../utils/mappingUtils'
import { dsPropType, tableTypes } from './MappingConsts'
import { MappingContext, useMappingState } from '../../mappingContext'
import ThresholdInput from './ThresholdInput'
import SaveMapping from './SaveMapping'

const MappingPage = ({ sourceDs, targetDs, urlParams }) => {
  const sourceDes = flattenDataSets(sourceDs)
  const targetDes = flattenDataSets(targetDs)
  const mappingState = useMappingState(sourceDes, targetDes)
  const { sourceUrl, targetUrl } = urlParams
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
        <SaveMapping mapConfig={mapConfig} mappings={mappingState.mappings} />
      </div>

      <MappingContext.Provider value={mappingState}>
        <MappingTable
          sourceOpts={sourceDes}
          targetOpts={targetDes}
          urlParams={urlParams}
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
  urlParams: PropTypes.shape({
    sourceUrl: PropTypes.string.isRequired,
    targetUrl: PropTypes.string.isRequired,
  }),
}

export default MappingPage
