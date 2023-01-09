import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { useDataEngine, useAlert } from '@dhis2/app-runtime'
import { mapConfigType } from './sharedPropTypes'
import { getDsData, PatRequestError } from '../../utils/apiUtils'
import {
  dataSetsEquivalent,
  updateRequiredMappings,
} from '../../utils/mappingUtils'
import { SharedStateContext } from '../../sharedStateContext'
import { dsLocations } from '../SetupPage/SetupPageConsts'
import SavePatModal from './SavePatModal'
import { Button } from '@dhis2/ui'
import { mappingDestinations } from './MappingConsts'

const RefreshMetadata = ({
  mapConfig,
  setShowDeMapping,
  setShowAocMapping,
  setShowOuMapping,
  setMetadataRefreshed,
}) => {
  const { sourceDs, targetDs, sourceUrl, targetUrl } = mapConfig
  const [updatedSourceDs, setUpdatedSourceDs] = useState(null)
  const [updatedTargetDs, setUpdatedTargetDs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modalData, setModalData] = useState(null)
  const sharedState = useContext(SharedStateContext)
  const { show } = useAlert((msg) => msg, { success: true })
  const { show: showError } = useAlert((msg) => msg, { critical: true })
  const engine = useDataEngine()

  useEffect(() => {
    if (updatedSourceDs && updatedTargetDs) {
      const sourcesMatch = dataSetsEquivalent(updatedSourceDs, sourceDs)
      const targetsMatch = dataSetsEquivalent(updatedTargetDs, targetDs)
      const newDsConfig = { source: null, target: null }
      if (!sourcesMatch) {
        newDsConfig.source = updatedSourceDs
      }
      if (!targetsMatch) {
        newDsConfig.target = updatedTargetDs
      }
      if (!sourcesMatch || !targetsMatch) {
        try {
          updateRequiredMappings(newDsConfig, sharedState)
          setMetadataRefreshed(true)
          show(
            'Metadata refresh complete, to save updates after review, use the Save mapping button'
          )
        } catch (err) {
          console.error(err)
          showError('Error updating mappings')
        } finally {
          setLoading(false)
        }
      } else {
        show('No data set changes detected')
        setLoading(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedSourceDs, updatedTargetDs])

  const getMetadataUpdate = async (
    baseAddress,
    updateAddress,
    dsMeta,
    destination,
    pat = null
  ) => {
    const config = { baseUrl: updateAddress }
    const dsIds = dsMeta.map(({ id }) => id)
    config.dsLocation =
      baseAddress === updateAddress
        ? dsLocations.currentServer
        : dsLocations.externalServer
    try {
      const updatedDataSetMeta = await getDsData(engine, dsIds, config, pat)
      if (destination === mappingDestinations.SOURCE) {
        setUpdatedSourceDs(updatedDataSetMeta)
      } else if (destination === mappingDestinations.TARGET) {
        setUpdatedTargetDs(updatedDataSetMeta)
      }
    } catch (err) {
      if (err instanceof PatRequestError) {
        // If different user to setup user is refreshing from an external server
        // then the credentials to access the server might not be available
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
    setLoading(true)
    setShowDeMapping(false)
    setShowAocMapping(false)
    setShowOuMapping(false)
    const baseAddress = window.location.origin
    try {
      await getMetadataUpdate(baseAddress, sourceUrl, sourceDs, 'source')
      await getMetadataUpdate(baseAddress, targetUrl, targetDs, 'target')
    } catch (err) {
      console.error(err)
      showError('Error updating mappings')
      setLoading(false)
    }
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
      <Button
        loading={loading}
        primary
        onClick={handleRefresh}
        className="refreshButton"
      >
        Refresh metadata
      </Button>
    </>
  )
}

RefreshMetadata.propTypes = {
  mapConfig: mapConfigType,
  setShowDeMapping: PropTypes.func.isRequired,
  setShowAocMapping: PropTypes.func.isRequired,
  setShowOuMapping: PropTypes.func.isRequired,
  setMetadataRefreshed: PropTypes.func.isRequired,
}

export default RefreshMetadata