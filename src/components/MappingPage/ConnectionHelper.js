import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { dsLocations, connectionTypes } from '../SetupPage/SetupPageConsts'
import ExternalServerDsSelect from '../SetupPage/ExternalServerDsSelect'
import CircularLoader from './CircularLoader/CircularLoader'
import { Modal, ModalTitle, ModalContent } from '@dhis2/ui'
import './MappingPage.css'
import { mappingDestinations } from './MappingConsts'

const ConnectionHelper = ({
  modalData,
  setModalData,
  getMetadataUpdate,
  setUpdatedSourceDs,
  setUpdatedTargetDs,
}) => {
  const { baseAddress, updateAddress, dsMeta, destination } = modalData
  const [selectedDs, setSelectedDs] = useState([])
  const [method, setMethod] = useState(connectionTypes.PAT)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState({
    baseUrl: updateAddress,
    dsLocation: dsLocations.externalServer,
  })

  const getUpdates = async () => {
    if (method === connectionTypes.PAT) {
      setLoading(true)
      await getMetadataUpdate(baseAddress, updateAddress, dsMeta, destination)
    } else if (method === connectionTypes.UPLOAD) {
      if (destination === mappingDestinations.SOURCE) {
        setUpdatedSourceDs(selectedDs)
      } else if (destination === mappingDestinations.TARGET) {
        setUpdatedTargetDs(selectedDs)
      }
    } else {
      console.error('Unsupported method: ' + method)
    }
    setSelectedDs([])
    setLoading(false)
    setModalData(null)
  }

  useEffect(() => {
    if (selectedDs.length) {
      getUpdates()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDs])

  return (
    <Modal>
      <ModalTitle>Connection Helper</ModalTitle>
      <ModalContent>
        <p>
          It was not possible to automatically fetch the metadata updates from
          the {destination} server. Please provide additional information
        </p>
        {loading ? (
          <CircularLoader label="Loading" small />
        ) : (
          <ExternalServerDsSelect
            selectedDs={selectedDs}
            setSelectedDs={setSelectedDs}
            config={config}
            setConfig={setConfig}
            method={method}
            setMethod={setMethod}
            previousSelectedDsIds={dsMeta.map(({ id }) => id)}
            onCancel={() => setModalData(null)}
          />
        )}
      </ModalContent>
    </Modal>
  )
}

ConnectionHelper.propTypes = {
  modalData: PropTypes.object,
  setModalData: PropTypes.func.isRequired,
  getMetadataUpdate: PropTypes.func.isRequired,
  setUpdatedSourceDs: PropTypes.func.isRequired,
  setUpdatedTargetDs: PropTypes.func.isRequired,
}

export default ConnectionHelper
