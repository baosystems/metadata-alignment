import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { savePat } from '../../utils/apiUtils'
import {
  Modal,
  ModalTitle,
  ModalContent,
  ModalActions,
  InputField,
  Button,
} from '@dhis2/ui'
import './MappingPage.css'

const SavePatModal = ({ modalData, setModalData, getMetadataUpdate }) => {
  const { engine, baseAddress, updateAddress, dsMeta, destination } = modalData
  console.log('modalData: ', modalData)
  const [pat, setPat] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await savePat(engine, updateAddress, pat)
    await getMetadataUpdate(
      baseAddress,
      updateAddress,
      dsMeta,
      destination,
      pat
    )
    setLoading(false)
    setModalData(null)
  }
  const modalTitle = `Enter personal access token for ${updateAddress}`
  return (
    <Modal>
      <ModalTitle>{modalTitle}</ModalTitle>
      <ModalContent>
        <InputField
          value={pat}
          onChange={(e) => setPat(e.value)}
          label="Personal access token"
        />
      </ModalContent>
      <ModalActions>
        <div className="modalActions">
          <Button onClick={() => setModalData(null)}>Cancel</Button>
          <Button primary loading={loading} onClick={handleSave}>
            Continue
          </Button>
        </div>
      </ModalActions>
    </Modal>
  )
}

SavePatModal.propTypes = {
  modalData: PropTypes.object,
  setModalData: PropTypes.func.isRequired,
  getMetadataUpdate: PropTypes.func.isRequired,
}

export default SavePatModal
