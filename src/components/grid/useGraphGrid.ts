import { watch, reactive, inject } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { GraphDataProvider } from '../../data-providers'

export default function(props, option, dataCallback) {
  const vGridOptions = inject('$vgrid', {})
  const apolloClient = inject(DefaultApolloClient)

  const graphOptions = {
    resource: props.resource,
    searchField: props.searchField,
    refFilter: props.refFilter,
    offsetKey: vGridOptions.offsetKey,
    limitKey: vGridOptions.limitKey,
    filterKey: vGridOptions.filterKey,
    aggregateQuery: vGridOptions.aggregateQuery,
    graphqlFilter: vGridOptions.graphqlFilter,
    graphqlOrder: vGridOptions.graphqlOrder,
    graphqlDataCounter: vGridOptions.graphqlDataCounter,
  }

  const gridOption = reactive({
    searchable: props.searchable,
    orderable: props.orderable,
    filterable: props.filterable,
    columnFilterable: props.columnFilterable,
    columnVisible: props.columnVisible,
    statusable: props.statusable,
    pagination: props.pagination,
    exportable: props.exportable,
    columns: props.columns,
    // limit: limit.value,
    ...graphOptions,
    ...option,
  })
  const dataProvider = new GraphDataProvider(apolloClient, props.resource, gridOption)

  watch(
    () => props.refFilter,
    () => {
      // TODO reset grid
      // setDataCollections()
    },
  )

  return {
    dataProvider,
    gridOption,
  }
}
