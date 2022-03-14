import React, { useState } from 'react'
import DsSelect from './DsSelect'
import { Button } from '@dhis2/ui'
import { IconArrowRight24 } from '@dhis2/ui-icons'
import './SetupPage.css'

const SetupPage = () => {
  const [sourceDsIds, setSourceDsIds] = useState([])
  const [targetDsIds, setTargetDsIds] = useState([])
  const disableContinue = sourceDsIds.length < 1 || targetDsIds.length < 1
  return (
    <div className="setupPage">
      <div className="dsSelectSetup">
        <DsSelect
          selectedDs={sourceDsIds}
          setSelectedDs={setSourceDsIds}
          type="source"
        />
        <IconArrowRight24 />
        <DsSelect
          selectedDs={targetDsIds}
          setSelectedDs={setTargetDsIds}
          type="target"
        />
      </div>

      <div className="configBtnWrapper">
        <Button disabled={disableContinue} className="configMap" primary>
          Configure mapping
        </Button>
      </div>
    </div>
  )
}

export default SetupPage
