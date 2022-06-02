import { watch, reactive, inject } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { GraphDataProvider } from '../../data-providers'
import useOption from './useOption'

export default function(props, option, dataCallback) {
  const vGridOptions = inject('$vgrid', {})
  const apolloClient = inject(DefaultApolloClient)

  const graphOptions = {
    resource: props.resource,
    resourceMeta: props.resourceMeta,
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
    ...useOption(props),
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