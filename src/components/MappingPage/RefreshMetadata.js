import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { useDataEngine, useAlert } from '@dhis2/app-runtime'
import { mapConfigType } from './sharedPropTypes'
import {
  getBaseAddress,
  getDsData,
  PatRequestError,
} from '../../utils/apiUtils'
import {
  dataSetsEquivalent,
  updateRequiredMappings,
} from '../../utils/mappingUtils'
import { SharedStateContext } from '../../sharedStateContext'
import { dsLocations } from '../SetupPage/SetupPageConsts'
import SavePatModal from './SavePatModal'
import { Button } from '@dhis2/ui'

const RefreshMetadata = ({
  mapConfig,
  setShowDeMapping,
  setShowAocMapping,
}) => {
  const { sourceDs, targetDs, sourceUrl, targetUrl } = mapConfig
  const [updatedDsMeta, setUpdatedDsMeta] = useState({
    source: null,
    target: null,
  })
  const [modalData, setModalData] = useState(null)
  const sharedState = useContext(SharedStateContext)
  const { show } = useAlert((msg) => msg, { success: true })
  const engine = useDataEngine()

  useEffect(() => {
    const { source, target } = updatedDsMeta
    if (source && target) {
      const sourcesMatch = dataSetsEquivalent(source, sourceDs)
      const targetsMatch = dataSetsEquivalent(target, targetDs)
      const newDsConfig = { source: null, target: null }
      if (!sourcesMatch) {
        newDsConfig.source = source
      }
      if (!targetsMatch) {
        newDsConfig.target = target
      }
      if (!sourcesMatch || !targetsMatch) {
        updateRequiredMappings(newDsConfig, sharedState)
        show('Metadata refresh complete')
      } else {
        show('No data set changes detected')
      }
    }
  }, [updatedDsMeta])

  const getMetadataUpdate = async (
    baseAddress,
    updateAddress,
    dsMeta,
    destination,
    pat = null
  ) => {
    const protocol = updateAddress.includes('localhost') ? 'http' : 'https'
    const config = { baseUrl: `${protocol}://${updateAddress}` }
    const dsIds = dsMeta.map(({ id }) => id)
    config.dsLocation =
      baseAddress === updateAddress
        ? dsLocations.currentServer
        : dsLocations.externalServer
    try {
      const updatedDataSetMeta = await getDsData(engine, dsIds, config, pat)
      setUpdatedDsMeta({ ...updatedDsMeta, [destination]: updatedDataSetMeta })
    } catch (err) {
      if (err instanceof PatRequestError) {
        // If different user to setup user is refreshing from an external server
        // then the credendentials to access the server might not be available
        setModalData({
          engine,
          baseAddress,
          updateAddress,
          dsMeta,
          destination,
        })
      } else {
        throw err
      }
    }
  }

  const handleRefresh = async () => {
    setShowDeMapping(false)
    setShowAocMapping(false)
    const baseAddress = getBaseAddress()
    await getMetadataUpdate(baseAddress, sourceUrl, sourceDs, 'source')
    await getMetadataUpdate(baseAddress, targetUrl, targetDs, 'target')
  }

  return (
    <>
      {modalData && (
        <SavePatModal
          modalData={modalData}
          setModalData={setModalData}
          getMetadataUpdate={getMetadataUpdate}
        />
      )}
      <Button primary onClick={handleRefresh} className="refreshButton">
        Refresh metadata
      </Button>
    </>
  )
}

RefreshMetadata.propTypes = {
  mapConfig: mapConfigType,
  setShowDeMapping: PropTypes.func.isRequired,
  setShowAocMapping: PropTypes.func.isRequired,
}

export default RefreshMetadata
