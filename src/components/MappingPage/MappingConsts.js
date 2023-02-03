export const tableTypes = {
  DE: 'de',
  COC: 'coc',
  AOC: 'aoc',
  OU: 'ou',
}

export const tableTypeKeys = {
  [tableTypes.DE]: {
    sourceKey: 'sourceDes',
    targetKey: 'targetDes',
  },
  [tableTypes.COC]: {
    sourceKey: 'sourceCocs',
    targetKey: 'targetCocs',
  },
  [tableTypes.AOC]: {
    sourceKey: 'sourceAocs',
    targetKey: 'targetAocs',
  },
  [tableTypes.OU]: {
    sourceKey: 'sourceOus',
    targetKey: 'targetOus',
  },
}

export const mappingsKey = 'mappings'

export const deCocCsvExportHeaders = [
  'dataitemid_src',
  'catoptcomboid_src',
  'dataitemid_tgt',
  'catoptcomboid_tgt',
]

export const aocCsvExportHeaders = ['attoptcomboid_src', 'attoptcomboid_tgt']

export const ouCsvExportHeaders = ['orgunitid_src', 'orgunitid_tgt']

export const mappingDestinations = {
  SOURCE: 'source',
  TARGET: 'target',
}
