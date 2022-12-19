import React from 'react'
import PropTypes from 'prop-types'
import MappingTable from '../MappingTable'
import { tableTypes } from '../MappingConsts'

const OuMappingTable = (props) => {
  console.log(props)
  if (!props.sourceOpts || !props.targetOpts) {
    return <p>No ou options found, please try refreshing the mapping</p>
  }
  return <MappingTable tableType={tableTypes.OU} {...props} />
}

OuMappingTable.propTypes = {
  sourceOpts: PropTypes.array,
  targetOpts: PropTypes.array,
}

export default OuMappingTable
