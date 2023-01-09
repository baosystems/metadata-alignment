export const allDsQuery = {
  allDataSets: {
    resource: 'dataSets',
    params: {
      fields: 'id,displayName~rename(name)',
      paging: 'false',
    },
  },
}

const catCombos = 'categoryCombo(id,name,categoryOptionCombos(id,name))'
const dataSetElements =
  'dataSetElements(dataElement(id,name,categoryCombo(categoryOptionCombos(id,name))))'
const orgUnits = 'organisationUnits(id,name,ancestors(id,name)'

export const dsInfoQuery = {
  dataSets: {
    resource: 'dataSets',
    params: ({ dsIds }) => ({
      fields: ['id,name', catCombos, dataSetElements, orgUnits].join(','),
      filter: `id:in:[${dsIds.join(',')}]`,
    }),
  },
}
