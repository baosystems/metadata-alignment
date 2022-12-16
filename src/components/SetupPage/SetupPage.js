import React, { useState, useContext } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import DsSelect from './DsSelect'
import { Button } from '@dhis2/ui'
import { IconArrowRight24 } from '@dhis2/ui-icons'
import './SetupPage.css'
import { getDsData } from '../../utils/apiUtils'
import { SharedStateContext } from '../../sharedStateContext'
import { useHistory } from 'react-router-dom'

const SetupPage = () => {
  const sharedState = useContext(SharedStateContext)
  const initConfig = { dsLocation: null, baseUrl: 'https://', urlValid: true }
  const [sourceDsIds, setSourceDsIds] = useState([])
  const [sourceConfig, setSourceConfig] = useState({ ...initConfig })
  const [targetDsIds, setTargetDsIds] = useState([])
  const [targetConfig, setTargetConfig] = useState({ ...initConfig })
  const [loadingDs, setLoadingDs] = useState(false)
  const disableContinue = sourceDsIds.length < 1 || targetDsIds.length < 1
  const engine = useDataEngine()
  const history = useHistory()

  const formatUrl = (url) => {
    // If current server then url field will be default value (https://), so set to origin
    return url === 'https://' ? window.location.origin : url
  }

  const getDataSets = async () => {
    setLoadingDs(true)
    const sourceDs = await getDsData(engine, sourceDsIds, sourceConfig)
    const targetDs = await getDsData(engine, targetDsIds, targetConfig)
    sharedState.setSourceUrl(formatUrl(sourceConfig.baseUrl))
    sharedState.setTargetUrl(formatUrl(targetConfig.baseUrl))
    sharedState.setSourceDs(sourceDs)
    sharedState.setTargetDs(targetDs)
    sharedState.setCurrentMapping([])
    sharedState.setCurrentMappingAocs([])
    history.push('/edit')
  }

  return (
    <div className="setupPage">
      <div className="dsSelectSetup">
        <DsSelect
          selectedDs={sourceDsIds}
          setSelectedDs={setSourceDsIds}
          config={sourceConfig}
          setConfig={setSourceConfig}
          type="source"
        />
        <IconArrowRight24 />
        <DsSelect
          selectedDs={targetDsIds}
          setSelectedDs={setTargetDsIds}
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
