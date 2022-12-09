import React from 'react'
import { Button } from '@dhis2/ui'

const RefreshMetadata = () => {
  const handleRefresh = () => {
    console.log('TODO: Refresh')
  }

  return (
    <Button primary onClick={handleRefresh} className="refreshButton">
      Refresh metadata
    </Button>
  )
}

export default RefreshMetadata
