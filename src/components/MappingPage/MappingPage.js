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
import { useLocation } from 'react-router-dom'
import {
  flattenAocs,
  flattenDataSetElements,
  flattenOus,
  populateSuggestions,
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
import APExport from './APExport'
import { SharedStateContext } from '../../sharedStateContext'
import spawnSuggestionWorker from '../../spawn-worker'
import useSuggestions from '../../hooks/useSuggestions'

const MappingPage = () => {
  const sharedState = useContext(SharedStateContext)
  const {
    sourceDs,
    targetDs,
    sourceUrl,
    targetUrl,
    currentMapping,
    mappingPipelines,
  } = sharedState
  const { pathname } = useLocation()
  const sourceDes = flattenDataSetElements(sourceDs)
  const targetDes = flattenDataSetElements(targetDs)
  const sourceAocs = flattenAocs(sourceDs)
  const targetAocs = flattenAocs(targetDs)
  const sourceOus = flattenOus(sourceDs)
  const targetOus = flattenOus(targetDs)
  const sourceMeta = {
    [tableTypes.DE]: sourceDes,
    [tableTypes.AOC]: sourceAocs,
    [tableTypes.OU]: sourceOus,
  }
  const mappingState = useMappingState(
    sourceDes,
    targetDes,
    sourceAocs,
    targetAocs,
    sourceOus,
    targetOus,
    currentMapping[tableTypes.DE],
    currentMapping[tableTypes.AOC],
    currentMapping[tableTypes.OU],
    mappingPipelines
  )
  const mapConfig = { sourceDs, targetDs, sourceUrl, targetUrl }
  const [matchThreshold, setMatchThreshold] = useState(0.5)
  const [showDeMapping, setShowDeMapping] = useState(false)
  const [showAocMapping, setShowAocMapping] = useState(false)
  const [showOuMapping, setShowOuMapping] = useState(false)
  const [metadataRefreshed, setMetadataRefreshed] = useState(false)
  const [suggestions, setSuggestions] = useSuggestions()
  const { show: showInfo, hide: hideInfo } = useAlert((msg) => msg, {
    info: true,
  })
  const { show: showSuccess } = useAlert((msg) => msg, { success: true })
  const notify = { showSuccess, hideInfo }

  const autofillSuggestions = (tableType) => {
    const { deCocMappings, aocMappings, ouMappings } = mappingState
    const { setDeCocMappings, setAocMappings, setOuMappings } = mappingState
    const autofillConfig = {
      [tableTypes.DE]: { setter: setDeCocMappings, current: deCocMappings },
      [tableTypes.AOC]: { setter: setAocMappings, current: aocMappings },
      [tableTypes.OU]: { setter: setOuMappings, current: ouMappings },
    }
    const config = {
      suggestions: suggestions[tableType],
      sourceItems: sourceMeta[tableType],
      matchThreshold,
      setValues: autofillConfig[tableType].setter,
      tableType,
    }
    populateSuggestions(autofillConfig[tableType].current, config, notify)
  }

  useEffect(() => {
    autofillSuggestions(tableTypes.DE)
    autofillSuggestions(tableTypes.OU)
    autofillSuggestions(tableTypes.AOC)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchThreshold])

  useEffect(() => {
    if (pathname.includes('new')) {
      if (suggestions[tableTypes.DE]) {
        autofillSuggestions(tableTypes.DE)
      }
      if (suggestions[tableTypes.AOC]) {
        autofillSuggestions(tableTypes.AOC)
      }
      if (suggestions[tableTypes.OU]) {
        autofillSuggestions(tableTypes.OU)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions])

  useEffect(() => {
    spawnSuggestionWorker(sourceDes, targetDes, metaTypes.DE_COC).then(
      (deCocs) => setSuggestions[tableTypes.DE](deCocs)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    spawnSuggestionWorker(sourceAocs, targetAocs, metaTypes.AOC).then((aocs) =>
      setSuggestions[tableTypes.AOC](aocs)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    showInfo('Generating OU suggestions')
    spawnSuggestionWorker(sourceOus, targetOus, metaTypes.OU).then((ous) => {
      setSuggestions[tableTypes.OU](ous)
      hideInfo()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      suggestions={suggestions[tableTypes.DE]}
      deCocMap={mappingState.deCocMap}
      tableType={tableTypes.DE}
    />
  )

  const expandableContentAoc = (
    <MappingTable
      sourceOpts={sourceAocs}
      targetOpts={targetAocs}
      urlParams={{ sourceUrl, targetUrl }}
      mappings={mappingState.aocMappings}
      setMappings={mappingState.setAocMappings}
      suggestions={suggestions[tableTypes.AOC]}
      tableType={tableTypes.AOC}
    />
  )

  const expandableContentOu = (
    <OuMappingTable
      sourceOpts={sourceOus}
      targetOpts={targetOus}
      urlParams={{ sourceUrl, targetUrl }}
      mappings={mappingState.ouMappings}
      setMappings={mappingState.setOuMappings}
      suggestions={suggestions[tableTypes.OU]}
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
            setSuggestions={setSuggestions}
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
            mappingPipelines={sharedState.mappingPipelines}
          />
          <APExport
            mapConfig={mapConfig}
            mappingPipelines={sharedState.mappingPipelines}
            setMappingPipelines={sharedState.setMappingPipelines}
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
