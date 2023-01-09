import React, { useContext, useEffect, useState } from 'react'
import {
  DataTable,
  DataTableFoot,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from '@dhis2/ui'
import { useAlert } from '@dhis2/app-runtime'
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
  const [metadataRefreshed, setMetadataRefreshed] = useState(false)
  const [deCocSuggestions, setDecCocSuggestions] = useState({})
  const [aocSuggestions, setAocSuggestions] = useState({})
  const [ouSuggestions, setOuSuggestions] = useState({})
  const { show: showInfo } = useAlert((msg) => msg, { info: true })
  const { show: showSuccess } = useAlert((msg) => msg, { success: true })

  useEffect(() => {
    if (metadataRefreshed) {
      spawnSuggestionWorker(sourceDes, targetDes, metaTypes.DE_COC).then(
        (deCocs) => setDecCocSuggestions(deCocs)
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataRefreshed])

  useEffect(() => {
    if (metadataRefreshed) {
      spawnSuggestionWorker(sourceAocs, targetAocs, metaTypes.AOC).then(
        (aocs) => setAocSuggestions(aocs)
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataRefreshed])

  useEffect(() => {
    if (metadataRefreshed) {
      showInfo('Generating OU suggestions')
      spawnSuggestionWorker(sourceOus, targetOus, metaTypes.OU).then((ous) => {
        setOuSuggestions(ous)
        showSuccess('Successfully generated OU suggestions')
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataRefreshed])

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
      makeInitialSuggestions={
        (currentMapping && currentMapping.length === 0) || metadataRefreshed
      }
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
      makeInitialSuggestions={
        (currentMappingAocs && currentMappingAocs.length === 0) ||
        metadataRefreshed
      }
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
      makeInitialSuggestions={
        (currentMappingOus && currentMappingOus.length === 0) ||
        metadataRefreshed
      }
    />
  )

  if (showDeMapping && showAocMapping && showOuMapping && metadataRefreshed) {
    setMetadataRefreshed(false)
  }

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
            setShowOuMapping={setShowOuMapping}
            setMetadataRefreshed={setMetadataRefreshed}
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
