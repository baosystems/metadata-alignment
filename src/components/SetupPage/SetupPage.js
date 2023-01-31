import React, { useState, useContext } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import DsSelect from './DsSelect'
import { Button } from '@dhis2/ui'
import { IconArrowRight24 } from '@dhis2/ui-icons'
import './SetupPage.css'
import { requestDsData } from '../../utils/apiUtils'
import { SharedStateContext } from '../../sharedStateContext'
import { useHistory } from 'react-router-dom'

const SetupPage = () => {
  const sharedState = useContext(SharedStateContext)
  const initConfig = { dsLocation: null, baseUrl: 'https://', urlValid: true }
  const [sourceDsInfo, setSourceDsInfo] = useState([])
  const [sourceConfig, setSourceConfig] = useState({ ...initConfig })
  const [targetDsInfo, setTargetDsInfo] = useState([])
  const [targetConfig, setTargetConfig] = useState({ ...initConfig })
  const [loadingDs, setLoadingDs] = useState(false)
  const disableContinue = sourceDsInfo.length < 1 || targetDsInfo.length < 1
  const engine = useDataEngine()
  const history = useHistory()

  const formatUrl = (url) => {
    // If current server then url field will be default value (https://), so set to origin
    return url === 'https://' ? window.location.origin : url
  }

  const getDsData = async (dsInfo, dsConfig) => {
    if (Array.isArray(dsInfo)) {
      if (dsInfo.length && typeof dsInfo[0] === 'string') {
        return await requestDsData(engine, dsInfo, dsConfig)
      } else {
        return dsInfo
      }
    } else {
      throw `Error getting DS data for ${dsInfo}`
    }
  }

  const getDataSets = async () => {
    setLoadingDs(true)
    const sourceDs = await getDsData(sourceDsInfo, sourceConfig)
    const targetDs = await getDsData(targetDsInfo, targetConfig)
    sharedState.setSourceUrl(formatUrl(sourceConfig.baseUrl))
    sharedState.setTargetUrl(formatUrl(targetConfig.baseUrl))
    sharedState.setSourceDs(sourceDs)
    sharedState.setTargetDs(targetDs)
    sharedState.setCurrentMapping([])
    sharedState.setCurrentMappingAocs([])
    sharedState.setCurrentMappingOus([])
    sharedState.setMappingPipelines({})
    history.push('/edit')
  }

  return (
    <div className="setupPage">
      <div className="dsSelectSetup">
        <DsSelect
          selectedDs={sourceDsInfo}
          setSelectedDs={setSourceDsInfo}
          config={sourceConfig}
          setConfig={setSourceConfig}
          type="source"
        />
        <IconArrowRight24 />
        <DsSelect
          selectedDs={targetDsInfo}
          setSelectedDs={setTargetDsInfo}
          config={targetConfig}
          setConfig={setTargetConfig}
          type="target"
        />
      </div>

      <div className="configBtnWrapper">
        <Button
          onClick={getDataSets}
          disabled={disableContinue}
          className="configMap"
          primary
          loading={loadingDs}
        >
          Configure mapping
        </Button>
      </div>
    </div>
  )
}

export default SetupPage
