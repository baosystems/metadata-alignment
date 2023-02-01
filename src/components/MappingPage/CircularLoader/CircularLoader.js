import React from 'react'
import PropTypes from 'prop-types'
import { CircularLoader as DhisCircularLoader } from '@dhis2/ui'
import './CircularLoader.css'

const CircularLoader = ({ label, labelPosition, ...props }) => {
  return (
    <div className="loaderWithLabel">
      {labelPosition === 'before' && label}
      <DhisCircularLoader {...props} />
      {labelPosition === 'after' && label}
    </div>
  )
}

CircularLoader.defaultProps = {
  labelPosition: 'after',
}

CircularLoader.propTypes = {
  label: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
  labelPosition: PropTypes.oneOf(['before', 'after']),
}

export default CircularLoader
