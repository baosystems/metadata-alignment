import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { getRowKey } from '../../utils/dataStoreUtils'
import { useDataQuery, useDataMutation, useAlert } from '@dhis2/app-runtime'
import { Button } from '@dhis2/ui'
import { MAPPING_INFO } from './ManagePageConsts'

const dsResource = `dataStore/${MAPPING_INFO.namespace}/${MAPPING_INFO.key}`

const getMapsQuery = {
  mappings: {
    resource: dsResource,
  },
}

const updateMapsMutation = {
  type: 'update',
  resource: dsResource,
  data: ({ data }) => data,
}

const DeleteMappingBtn = ({ mappingData, refresh }) => {
  const { show: showError } = useAlert((msg) => msg, { critical: true })
  const { show: showSuccess } = useAlert((msg) => msg, { success: true })
  const { error, data, refetch } = useDataQuery(getMapsQuery, {
    lazy: true,
  })
  const [mutate] = useDataMutation(updateMapsMutation, {
    onComplete: () => {
      showSuccess('Successfully deleted mapping')
      refresh() // Refresh mappings table after deletion
    },
    onError: () => showError('Error deleting mapping'),
  })

  const handleDelete = () => {
    refetch()
  }

  useEffect(() => {
    if (error) {
      showError('Error loading up to date mapping')
    }
    if (data) {
      const filteredMappings = data.mappings.filter(
        (mapping) => getRowKey(mappingData) !== getRowKey(mapping)
      )
      mutate({ data: filteredMappings })
    }
  }, [error, data])

  return (
    <Button destructive onClick={handleDelete}>
      Delete
    </Button>
  )
}

DeleteMappingBtn.propTypes = {
  mappingData: PropTypes.shape({
    sourceDs: PropTypes.shape({
      names: PropTypes.arrayOf(PropTypes.string),
      ids: PropTypes.arrayOf(PropTypes.string),
    }),
    targetDs: PropTypes.shape({
      names: PropTypes.arrayOf(PropTypes.string),
      ids: PropTypes.arrayOf(PropTypes.string),
    }),
    sourceUrl: PropTypes.string.isRequired,
    targetUrl: PropTypes.string.isRequired,
  }),
  refresh: PropTypes.func,
}

export default DeleteMappingBtn
