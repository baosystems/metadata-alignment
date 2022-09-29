import React, { useContext, useState } from 'react'
import {
  DataTable,
  DataTableFoot,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from '@dhis2/ui'
import MappingTable from './MappingTable'
import { flattenAocs, flattenDataSetElements } from '../../utils/mappingUtils'
import { tableTypes } from './MappingConsts'
import { MappingContext, useMappingState } from '../../mappingContext'
import ThresholdInput from './ThresholdInput'
import ExportMapping from './ExportMapping'
import SaveMapping from './SaveMapping'
import { SharedStateContext } from '../../sharedStateContext'

const MappingPage = () => {
  const sharedState = useContext(SharedStateContext)
  const {
    sourceDs,
    targetDs,
    sourceUrl,
    targetUrl,
    currentMapping,
    currentMappingAocs,
  } = sharedState
  if (!sourceDs.length > 0 || !targetDs.length > 0) {
    return (
      <p className="noMapping">
        Please setup or load a mapping via the other pages
      </p>
    )
  }
  const sourceDes = flattenDataSetElements(sourceDs)
  const targetDes = flattenDataSetElements(targetDs)
  const sourceAocs = flattenAocs(sourceDs)
  const targetAocs = flattenAocs(targetDs)
  const mappingState = useMappingState(
    sourceDes,
    targetDes,
    sourceAocs,
    targetAocs,
    currentMapping,
    currentMappingAocs
  )

  const mapConfig = { sourceDs, targetDs, sourceUrl, targetUrl }
  const [matchThreshold, setMatchThreshold] = useState(0.5)
  const [showDeMapping, setShowDeMapping] = useState(false)
  const [showAocMapping, setShowAocMapping] = useState(false)

  let expandableContentDe = (
    <MappingContext.Provider value={mappingState}>
      <MappingTable
        sourceOpts={sourceDes}
        targetOpts={targetDes}
        urlParams={{ sourceUrl, targetUrl }}
        mappings={mappingState.mappings}
        setMappings={mappingState.setMappings}
        suggestions={mappingState.rankedSuggestions}
        deCocMap={mappingState.deCocMap}
        tableType={tableTypes.DE}
        matchThreshold={Number(matchThreshold)}
        makeInitialSuggestions={currentMapping.length === 0}
      />
    </MappingContext.Provider>
  )

  let expandableContentAoc = (
    <MappingContext.Provider value={mappingState}>
      <MappingTable
        sourceOpts={sourceAocs}
        targetOpts={targetAocs}
        urlParams={{ sourceUrl, targetUrl }}
        mappings={mappingState.mappingsAocs}
        setMappings={mappingState.setMappingsAocs}
        suggestions={mappingState.rankedSuggestionsAocs}
        tableType={tableTypes.AOC}
        matchThreshold={Number(matchThreshold)}
        makeInitialSuggestions={currentMapping.length === 0}
      />
    </MappingContext.Provider>
  )

  return (
    <div className="mappingPage">
      <h1>Configure Data set mapping</h1>
      <div className="tableControls">
        <ThresholdInput
          extMatchThresh={matchThreshold}
          extSetMatchThresh={setMatchThreshold}
        />
        <ExportMapping mapConfig={mapConfig} mappings={mappingState.mappings} />
        <SaveMapping
          mapConfig={mapConfig}
          mappings={mappingState.mappings}
          mappingsAocs={mappingState.mappingsAocs}
        />
      </div>
      <DataTable>
        <DataTableBody>
          <DataTableRow
            key={`row-de`}
            expanded={showDeMapping}
            onExpandToggle={() => setShowDeMapping(!showDeMapping)}
            expandableContent={expandableContentDe}
          >
            <DataTableCell large={true}>Data Element/CoC Mapping</DataTableCell>
          </DataTableRow>
          <DataTableRow
            key={`row-aoc`}
            expanded={showAocMapping}
            onExpandToggle={() => setShowAocMapping(!showAocMapping)}
            expandableContent={expandableContentAoc}
          >
            <DataTableCell large={true}>AoC Mapping</DataTableCell>
          </DataTableRow>
        </DataTableBody>
        <DataTableFoot />
      </DataTable>
    </div>
  )
}

export default MappingPage
