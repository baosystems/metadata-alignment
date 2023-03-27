import React, { useEffect, useCallback } from 'react'
import {
  Modal,
  ModalTitle,
  ModalContent,
  ModalActions,
  Button,
} from '@dhis2/ui'
import PropTypes from 'prop-types'

const ConfirmDeleteModal = ({ removeRow, closeModal }) => {
  const handleDeleteRow = useCallback(() => {
    removeRow()
    closeModal()
  }, [removeRow, closeModal])

  const handleEnter = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleDeleteRow()
      }
    },
    [handleDeleteRow]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleEnter)
    return () => {
      // Remove event listener on cleanup
      window.removeEventListener('keydown', handleEnter)
    }
  }, [handleEnter])

  return (
    <Modal position="middle">
      <ModalTitle>Confirm Delete</ModalTitle>
      <ModalContent>
        Are you sure you want to delete this row? Click &apos;Delete&apos; or
        press the Enter key to confirm.
      </ModalContent>
      <ModalActions>
        <div className="deleteOptions">
          <Button onClick={closeModal}>Cancel</Button>
          <Button
            className="confirmDelete"
            autoFocus
            destructive
            onClick={handleDeleteRow}
          >
            Delete
          </Button>
        </div>
      </ModalActions>
    </Modal>
  )
}

ConfirmDeleteModal.propTypes = {
  removeRow: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
}

export default ConfirmDeleteModal
