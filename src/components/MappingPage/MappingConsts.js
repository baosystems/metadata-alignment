import PropTypes from 'prop-types'

export const tableTypes = {
  DE: 'de',
  COC: 'coc',
  AOC: 'aoc',
}

export const tableTypeKeys = {
  [tableTypes.COC]: {
    sourceKey: 'sourceCocs',
    targetKey: 'targetCocs',
  },
  [tableTypes.AOC]: {
    sourceKey: 'sourceAocs',
    targetKey: 'targetAocs',
  },
}

export const mappingsKey = 'mappings'

const idNameArray = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })
)

export const csvExportHeaders = [
  'dataitemid_src',
  'catoptcomboid_src',
  'dataitemid_tgt',
  'catoptcomboid_tgt',
]

export const aocCsvExportHeaders = [
  'attoptcomboid_src',
  'attoptcomboid_tgt',
]


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
