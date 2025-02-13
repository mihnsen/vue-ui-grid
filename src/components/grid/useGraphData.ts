import { computed, inject } from 'vue'
import { GraphDataProvider } from '../../data-providers'
import useOption from './useOption'

export default function(props, option) {
  const vGridOptions = inject('$vgrid', {
    filterKey: 'where',
    limitKey: 'limit',
    offsetKey: 'offset',
    aggregateQuery: 'aggregate { count }',
    graphqlFilter: null,
    graphqlOrder: null,
    graphqlDataCounter: null
  })
  const apolloClient = inject('$vgridApolloClient', null);

  if (!apolloClient) {
    throw new Error('$vgridApolloClient is not defined');
  }

  const baseOptions = useOption(props);

  const graphOptions = computed(() => ({
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
  }));

  const gridOption = computed(() => ({
    ...baseOptions.value,
    ...graphOptions.value,
    ...option,
  }))
  const dataProvider = new GraphDataProvider(apolloClient, props.resource, gridOption.value)

  return {
    dataProvider,
    gridOption,
  }
}
