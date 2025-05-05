import { computed, inject } from 'vue'
import { RelayDataProvider } from '../../data-providers'
import useOption from './useOption'

export default function(props, option) {
  const vGridOptions = inject('$vgrid', {
    cursorKey: 'cursor',
    filterKey: 'where',
    limitKey: 'after',
    offsetKey: 'offset',
    relayFilter: null,
    relayOrder: null,
  })
  const relayClient = inject('$vgridRelayClient', null);

  if (!relayClient) {
    throw new Error('$vgridRelayClient is not defined');
  }

  const baseOptions = useOption(props);

  const relayOptions = computed(() => ({
    resource: props.resource,
    resourceMeta: props.resourceMeta,
    searchField: props.searchField,
    refFilter: props.refFilter,
    pageKey: vGridOptions.cursorKey, // Support only cursor key

    offsetKey: vGridOptions.offsetKey,
    limitKey: vGridOptions.limitKey,
    filterKey: vGridOptions.filterKey,
    relayFilter: vGridOptions.relayFilter,
    relayOrder: vGridOptions.relayOrder,
  }));


  const gridOption = computed(() => ({
    ...baseOptions.value,
    ...relayOptions.value,
    ...option,
  }))

  if (!props.sortBy) {
    throw new Error('Relay grid require unique column to do pagination, should provide prop: sort-by')
  }
  const dataProvider = new RelayDataProvider(relayClient, props.resource, gridOption.value)

  return {
    dataProvider,
    gridOption,
  }
}
