import PropTypes from 'prop-types'

export const idNameArray = PropTypes.arrayOf(
  PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  })
)

export const dsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    dataSetElements: PropTypes.arrayOf(
      PropTypes.shape({
        dataElement: PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          categoryCombo: PropTypes.shape({
            categoryOptionCombo: idNameArray,
          }),
        }),
      })
    ),
  })
)

export const mapConfigType = PropTypes.shape({
  sourceDs: dsPropType,
  targetDs: dsPropType,
  sourceUrl: PropTypes.string.isRequired,
  targetUrl: PropTypes.string.isRequired,
})
