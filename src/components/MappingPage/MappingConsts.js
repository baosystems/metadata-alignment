import PropTypes from 'prop-types'

export const tableTypes = {
  DE: 'de',
  COC: 'coc',
}

export const mappingsKey = 'mappings'

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

export const csvExportHeaders = [
  'dataitemid_src',
  'catoptcomboid_src',
  'dataitemid_tgt',
  'catoptcomboid_tgt',
]
