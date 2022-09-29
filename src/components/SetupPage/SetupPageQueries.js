export const allDsQuery = {
  allDataSets: {
    resource: 'dataSets',
    params: {
      fields: 'id,displayName~rename(name)',
      paging: 'false',
    },
  },
}

export const dsInfoQuery = {
  dataSets: {
    resource: 'dataSets',
    params: ({ dsIds }) => ({
      fields:
        'id,name,categoryCombo(id,name,categoryOptionCombos(id,name)),dataSetElements(dataElement(id,name,categoryCombo(categoryOptionCombos(id,name))))',
      filter: `id:in:[${dsIds.join(',')}]`,
    }),
  },
}
