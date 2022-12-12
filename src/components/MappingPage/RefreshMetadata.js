import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { useDataEngine, useAlert } from '@dhis2/app-runtime'
import { mapConfigType } from './sharedPropTypes'
import { getBaseAddress, getDsData } from '../../utils/apiUtils'
import {
  dataSetsEquivalent,
  updateRequiredMappings,
} from '../../utils/mappingUtils'
import { SharedStateContext } from '../../sharedStateContext'
import { dsLocations } from '../SetupPage/SetupPageConsts'
import { Button } from '@dhis2/ui'

const RefreshMetadata = ({
  mapConfig,
  setShowDeMapping,
  setShowAocMapping,
}) => {
  const { sourceDs, targetDs, sourceUrl, targetUrl } = mapConfig
  const sharedState = useContext(SharedStateContext)
  const { show } = useAlert((msg) => msg, { success: true })
  const engine = useDataEngine()

  const getMetadataUpdate = async (baseAddress, updateAddress, dsMeta) => {
    const protocall = updateAddress.includes('localhost') ? 'http' : 'https'
    const config = { baseUrl: `${protocall}://${updateAddress}` }
    const dsIds = dsMeta.map(({ id }) => id)
    config.dsLocation =
      baseAddress === updateAddress
        ? dsLocations.currentServer
        : dsLocations.externalServer
    const updatedDsMeta = await getDsData(engine, dsIds, config)
    const dsNames = dsMeta.map(({ name }) => name).join(', ')
    if (dataSetsEquivalent(dsMeta, updatedDsMeta)) {
      show(`No updates detected for data sets: ${dsNames}`)
    } else {
      return updatedDsMeta
    }
  }

  const handleRefresh = async () => {
    setShowDeMapping(false)
    setShowAocMapping(false)
    const baseAddress = getBaseAddress()
    const updatedSourceDs = await getMetadataUpdate(
      baseAddress,
      sourceUrl,
      sourceDs
    )
    const updatedTargetDs = await getMetadataUpdate(
      baseAddress,
      targetUrl,
      targetDs
    )
    const newDsConfig = { source: updatedSourceDs, target: updatedTargetDs }
    if (updatedSourceDs || updatedTargetDs) {
      updateRequiredMappings(newDsConfig, sharedState)
      show('Metadata refresh complete')
    }
  }

  return (
    <Button primary onClick={handleRefresh} className="refreshButton">
      Refresh metadata
    </Button>
  )
}

RefreshMetadata.propTypes = {
  mapConfig: mapConfigType,
  setShowDeMapping: PropTypes.func.isRequired,
  setShowAocMapping: PropTypes.func.isRequired,
}

export default RefreshMetadata
