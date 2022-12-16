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

export const csvExportHeaders = [
  'dataitemid_src',
  'catoptcomboid_src',
  'dataitemid_tgt',
  'catoptcomboid_tgt',
]

export const aocCsvExportHeaders = ['attoptcomboid_src', 'attoptcomboid_tgt']

export const mappingDestinations = {
  SOURCE: 'source',
  TARGET: 'target',
}
