import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useDataMutation, useAlert } from '@dhis2/app-runtime'
import {
  Button,
  Modal,
  ModalTitle,
  ModalContent,
  ModalActions,
} from '@dhis2/ui'
import { MAPPING_INFO } from './ManagePageConsts'

const dsResource = `dataStore/${MAPPING_INFO.namespace}/${MAPPING_INFO.key}`

const updateMapsMutation = {
  type: 'update',
  resource: dsResource,
  data: ({ data }) => data,
}

const DeleteMappingBtn = ({ mappingData, allMaps, refresh }) => {
  const { show: showError } = useAlert((msg) => msg, { critical: true })
  const { show: showSuccess } = useAlert((msg) => msg, { success: true })
  const [mutate] = useDataMutation(updateMapsMutation, {
    onComplete: () => {
      showSuccess('Successfully deleted mapping')
      refresh() // Refresh mappings table after deletion
    },
    onError: () => showError('Error deleting mapping'),
  })
  const [confirmDelete, setConfirmDeleteModal] = useState(false)
  const confirmCancelHandler = () => {
    setConfirmDeleteModal(!confirmDelete)
  }

  const handleDelete = () => {
    const filteredMappings = allMaps.filter(
      ({ rowKey }) => rowKey !== mappingData.rowKey
    )
    mutate({ data: filteredMappings })
  }

  return (
    <>
      <Button destructive onClick={confirmCancelHandler}>
        Delete
      </Button>
      {confirmDelete && (
        <Modal>
          <ModalTitle>Confirm Delete</ModalTitle>
          <ModalContent>
            Are you sure you want to delete this Mapping?
            <br />
            <br />
            This action cannot be undone.
          </ModalContent>
          <ModalActions>
            <Button className="cancel-confirm" onClick={confirmCancelHandler}>
              Cancel
            </Button>
            <Button destructive onClick={handleDelete}>
              Delete
            </Button>
          </ModalActions>
        </Modal>
      )}
    </>
  )
}

const rowMap = PropTypes.shape({
  rowKey: PropTypes.string.isRequired,
  sourceDs: PropTypes.array,
  targetDs: PropTypes.array,
  sourceUrl: PropTypes.string,
  targetUrl: PropTypes.string,
})

DeleteMappingBtn.propTypes = {
  mappingData: rowMap,
  allMaps: PropTypes.arrayOf(rowMap),
  refresh: PropTypes.func,
}

export default DeleteMappingBtn
