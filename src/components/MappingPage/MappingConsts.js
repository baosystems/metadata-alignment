import PropTypes from 'prop-types'

export const tableTypes = {
  DE: 'de',
  COC: 'coc',
}

const idNameArray = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })
)

export const dsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    dataSetElements: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        categoryCombo: PropTypes.shape({
          categoryOptionCombo: idNameArray,
        }),
      })
    ),
  })
)
