import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Button } from '@dhis2/ui'
import { SharedStateContext } from '../../sharedStateContext'
import { useHistory } from 'react-router-dom'
import { metaTypes } from '../../mappingContext'

const EditMappingBtn = ({ mappingData }) => {
  const sharedState = useContext(SharedStateContext)
  const history = useHistory()

  // To handle legacy mappings where protocol was not in the data store
  const addProtocol = (url) => {
    if (url.slice(0, 4) === 'http') {
      return url
    } else {
      return url.includes('localhost') ? `http://${url}` : `https://${url}`
    }
  }

  const handleEdit = () => {
    sharedState.setSourceDs(mappingData.sourceDs)
    sharedState.setSourceUrl(addProtocol(mappingData.sourceUrl))
    sharedState.setTargetDs(mappingData.targetDs)
    sharedState.setTargetUrl(addProtocol(mappingData.targetUrl))
    sharedState.setCurrentMapping(mappingData.deCocMappings)
    sharedState.setCurrentMappingAocs(mappingData.aocMappings)
    sharedState.setCurrentMappingOus(mappingData.ouMappings)
    sharedState.setMappingPipelines(mappingData.mappingPipelines)
    history.push('/edit')
  }

  return <Button onClick={handleEdit}>Edit</Button>
}

EditMappingBtn.propTypes = {
  mappingData: PropTypes.shape({
    sourceDs: PropTypes.array.isRequired,
    targetDs: PropTypes.array.isRequired,
    sourceUrl: PropTypes.string.isRequired,
    targetUrl: PropTypes.string.isRequired,
    deCocMappings: PropTypes.arrayOf(
      PropTypes.shape({
        cocMappings: PropTypes.arrayOf(
          PropTypes.shape({
            sourceCocs: PropTypes.arrayOf(PropTypes.string),
            targetCocs: PropTypes.arrayOf(PropTypes.string),
          })
        ),
        sourceDes: PropTypes.arrayOf(PropTypes.string),
        targetDes: PropTypes.arrayOf(PropTypes.string),
      })
    ),
    aocMappings: PropTypes.arrayOf(
      PropTypes.shape({
        sourceAocs: PropTypes.arrayOf(PropTypes.string),
        targetAocs: PropTypes.arrayOf(PropTypes.string),
      })
    ),
    ouMappings: PropTypes.arrayOf(
      PropTypes.shape({
        sourceOus: PropTypes.arrayOf(PropTypes.string),
        targetOus: PropTypes.arrayOf(PropTypes.string),
      })
    ),
    mappingPipelines: PropTypes.objectOf(
      PropTypes.shape({
        [metaTypes.DE_COC]: PropTypes.string,
        [metaTypes.AOC]: PropTypes.string,
        [metaTypes.OU]: PropTypes.string,
      })
    ),
  }),
}

export default EditMappingBtn
