import React, { useContext, useEffect, useMemo, useState } from 'react'
import {
  DataTable,
  DataTableFoot,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from '@dhis2/ui'
import MappingTable from './MappingTable'
import OuMappingTable from './OuMappingTable/OuMappingTable'
import {
  flattenAocs,
  flattenDataSetElements,
  flattenOus,
} from '../../utils/mappingUtils'
import { tableTypes } from './MappingConsts'
import {
  MappingContext,
  metaTypes,
  useMappingState,
} from '../../mappingContext'
import ThresholdInput from './ThresholdInput'
import RefreshMetadata from './RefreshMetadata'
import ExportMapping from './ExportMapping'
import SaveMapping from './SaveMapping'
import { SharedStateContext } from '../../sharedStateContext'
import spawnSuggestionWorker from '../../spawn-worker'

const MappingPage = () => {
  const sharedState = useContext(SharedStateContext)
  const {
    sourceDs,
    targetDs,
    sourceUrl,
    targetUrl,
    currentMapping,
    currentMappingAocs,
    currentMappingOus,
  } = sharedState
  const sourceDes = flattenDataSetElements(sourceDs)
  const targetDes = flattenDataSetElements(targetDs)
  const sourceAocs = flattenAocs(sourceDs)
  const targetAocs = flattenAocs(targetDs)
  const sourceOus = flattenOus(sourceDs)
  const targetOus = flattenOus(targetDs)
  const mappingState = useMappingState(
    sourceDes,
    targetDes,
    sourceAocs,
    targetAocs,
    sourceOus,
    targetOus,
    currentMapping,
    currentMappingAocs,
    currentMappingOus
  )
  const mapConfig = { sourceDs, targetDs, sourceUrl, targetUrl }
  const [matchThreshold, setMatchThreshold] = useState(0.5)
  const [showDeMapping, setShowDeMapping] = useState(false)
  const [showAocMapping, setShowAocMapping] = useState(false)
  const [showOuMapping, setShowOuMapping] = useState(false)
  const [deCocSuggestions, setDecCocSuggestions] = useState({})
  const [aocSuggestions, setAocSuggestions] = useState({})
  const [ouSuggestions, setOuSuggestions] = useState({})

  useEffect(() => {
    spawnSuggestionWorker(sourceDes, targetDes, metaTypes.DE_COC).then(
      (deCocs) => {
        console.log('DE COC suggestions done')
        setDecCocSuggestions(deCocs)
      }
    )
  }, [])

  useEffect(() => {
    spawnSuggestionWorker(sourceAocs, targetAocs, metaTypes.AOC).then(
      (aocs) => {
        console.log('AOC suggestions done')
        setAocSuggestions(aocs)
      }
    )
  }, [])

  useEffect(() => {
    spawnSuggestionWorker(sourceOus, targetOus, metaTypes.OU).then((ous) => {
      console.log('OU suggestions done')
      setOuSuggestions(ous)
    })
  }, [])

  if (!sourceDs.length > 0 || !targetDs.length > 0) {
    return (
      <p className="noMapping">
        Please setup or load a mapping via the other pages
      </p>
    )
  }

  const expandableContentDe = (
    <MappingTable
      sourceOpts={sourceDes}
      targetOpts={targetDes}
      urlParams={{ sourceUrl, targetUrl }}
      mappings={mappingState.deCocMappings}
      setMappings={mappingState.setDeCocMappings}
      suggestions={deCocSuggestions}
      deCocMap={mappingState.deCocMap}
      tableType={tableTypes.DE}
      matchThreshold={Number(matchThreshold)}
      makeInitialSuggestions={currentMapping.length === 0}
    />
  )

  const expandableContentAoc = (
    <MappingTable
      sourceOpts={sourceAocs}
      targetOpts={targetAocs}
      urlParams={{ sourceUrl, targetUrl }}
      mappings={mappingState.aocMappings}
      setMappings={mappingState.setAocMappings}
      suggestions={aocSuggestions}
      tableType={tableTypes.AOC}
      matchThreshold={Number(matchThreshold)}
      makeInitialSuggestions={currentMappingAocs.length === 0}
    />
  )

  const expandableContentOu = (
    <OuMappingTable
      sourceOpts={sourceOus}
      targetOpts={targetOus}
      urlParams={{ sourceUrl, targetUrl }}
      mappings={mappingState.ouMappings}
      setMappings={mappingState.setOuMappings}
      suggestions={ouSuggestions}
      matchThreshold={Number(matchThreshold)}
      makeInitialSuggestions={currentMappingOus.length === 0}
    />
  )

  return (
    <MappingContext.Provider value={mappingState}>
      <div className="mappingPage">
        <h1>Configure Data set mapping</h1>
        <div className="tableControls">
          <ThresholdInput
            extMatchThresh={`${matchThreshold}`}
            extSetMatchThresh={setMatchThreshold}
          />
          <RefreshMetadata
            mapConfig={mapConfig}
            setShowDeMapping={setShowDeMapping}
            setShowAocMapping={setShowAocMapping}
          />
          <ExportMapping
            mapConfig={mapConfig}
            deCocMappings={mappingState.deCocMappings}
            aocMappings={mappingState.aocMappings}
            ouMappings={mappingState.ouMappings}
          />
          <SaveMapping
            mapConfig={mapConfig}
            deCocMappings={mappingState.deCocMappings}
            aocMappings={mappingState.aocMappings}
            ouMappings={mappingState.ouMappings}
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
              <DataTableCell large={true}>
                Data Element/CoC Mapping
              </DataTableCell>
            </DataTableRow>
            <DataTableRow
              key={`row-aoc`}
              expanded={showAocMapping}
              onExpandToggle={() => setShowAocMapping(!showAocMapping)}
              expandableContent={expandableContentAoc}
            >
              <DataTableCell large={true}>AoC Mapping</DataTableCell>
            </DataTableRow>
            <DataTableRow
              key={`row-ou`}
              expanded={showOuMapping}
              onExpandToggle={() => setShowOuMapping(!showOuMapping)}
              expandableContent={expandableContentOu}
            >
              <DataTableCell large={true}>OU Mapping</DataTableCell>
            </DataTableRow>
          </DataTableBody>
          <DataTableFoot />
        </DataTable>
      </div>
    </MappingContext.Provider>
  )
}

export default MappingPage
