import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connectionTypes } from './SetupPageConsts'
import PatDsSelect from './PatDsSelect'
import UploadDsSelect from './UploadDsSelect'
import { TabBar, Tab } from '@dhis2/ui'

const ExternalServerDsSelect = (props) => {
  const [selectedTab, setSelectedTab] = useState(connectionTypes.PAT)
  const currentTab = props?.method || selectedTab

  const handleTabChange = (title) => {
    if (props.setMethod) {
      props.setMethod(title)
    }
    setSelectedTab(title)
  }

  return (
    <div className="connectionMethodSelect">
      <TabBar className="connectionMethodTabBar">
        {Object.values(connectionTypes).map((title) => (
          <Tab
            onClick={() => handleTabChange(title)}
            key={title}
            selected={currentTab === title}
          >
            {title}
          </Tab>
        ))}
      </TabBar>
      {currentTab === connectionTypes.PAT && <PatDsSelect {...props} />}
      {currentTab === connectionTypes.UPLOAD && <UploadDsSelect {...props} />}
    </div>
  )
}

ExternalServerDsSelect.propTypes = {
  selectedDs: PropTypes.array.isRequired,
  setSelectedDs: PropTypes.func.isRequired,
  config: PropTypes.shape({
    dsLocation: PropTypes.string.isRequired,
    baseUrl: PropTypes.string,
  }).isRequired,
  fixedUrl: PropTypes.bool,
  setConfig: PropTypes.func.isRequired,
  method: PropTypes.string,
  setMethod: PropTypes.func,
  previousSelectedDs: PropTypes.array,
  onCancel: PropTypes.func,
}

export default ExternalServerDsSelect
