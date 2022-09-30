import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Button } from '@dhis2/ui'
import { SharedStateContext } from '../../sharedStateContext'
import { useHistory } from 'react-router-dom'

const EditMappingBtn = ({ mappingData }) => {
  const sharedState = useContext(SharedStateContext)

  const history = useHistory()

  const handleEdit = () => {
    sharedState.setSourceDs(mappingData.sourceDs)
    sharedState.setSourceUrl(mappingData.sourceUrl)
    sharedState.setTargetDs(mappingData.targetDs)
    sharedState.setTargetUrl(mappingData.targetUrl)
    sharedState.setCurrentMapping(mappingData.deCocMappings)
    sharedState.setCurrentMappingAocs(mappingData.aocMappings)
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
  }),
}

export default EditMappingBtn
