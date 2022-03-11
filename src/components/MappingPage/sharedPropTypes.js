import PropTypes from 'prop-types'

export const idNameArray = PropTypes.arrayOf(
  PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  })
)
