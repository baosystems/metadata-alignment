export const allDsQuery = {
  allDataSets: {
    resource: 'dataSets',
    params: {
      fields: 'id,displayName~rename(name)',
      paging: 'false',
    },
  },
}
