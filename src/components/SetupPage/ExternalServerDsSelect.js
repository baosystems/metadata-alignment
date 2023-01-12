import React, { useState } from 'react'
import PropTypes from 'prop-types'
import PatDsSelect from './PatDsSelect'
import UploadDsSelect from './UploadDsSelect'
import { TabBar, Tab } from '@dhis2/ui'

const ExternalServerDsSelect = (props) => {
  const tabs = ['PAT', 'Manual Upload']
  const [selectedTab, setSelectedTab] = useState(tabs[0])
  return (
    <div className="connectionMethodSelect">
      <TabBar className="connectionMethodTabBar">
        {tabs.map((title) => (
          <Tab
            onClick={() => setSelectedTab(title)}
            key={title}
            selected={selectedTab === title}
          >
            {title}
          </Tab>
        ))}
      </TabBar>
      {selectedTab === 'PAT' && <PatDsSelect {...props} />}
      {selectedTab === 'Manual Upload' && <UploadDsSelect {...props} />}
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
  setConfig: PropTypes.func.isRequired,
}

export default ExternalServerDsSelect
