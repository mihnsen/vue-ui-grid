import { computed, inject } from 'vue'
import { AjaxDataProvider } from '../../data-providers'
import useOption from './useOption'

export default function(props, option) {
  const vGridOptions = inject('$vgrid', {
    cursorKey: 'cursor',
    pageKey: 'page',
    hasSortType: true,
    sortKey: 'sort',
    sortTypeKey: 'sort_type',
    perPageKey: 'limit',
    fetchData: null,
    cancelToken: null,
    getPageIndex: null,
    extractData: null,
  })

  const baseOptions = useOption(props);

  const ajaxOptions = computed(() => ({
    resource: props.resource,
    searchField: props.searchField,
    pageKey: props.cursorPagination ? vGridOptions.cursorKey : vGridOptions.pageKey,
    cursorPagination: props.cursorPagination,
    perPageKey: vGridOptions.perPageKey,
    sortKey: vGridOptions.sortKey,
    sortTypeKey: vGridOptions.sortTypeKey,
    getPageIndex: vGridOptions.getPageIndex,
    extractData: vGridOptions.extractData,
    fetchData: vGridOptions.fetchData,
    cancelToken: vGridOptions.cancelToken
  }))

  const gridOption = computed(() => ({
    ...baseOptions.value,
    ...ajaxOptions.value,
    ...option,
  }))
  const dataProvider = new AjaxDataProvider(props.resource, gridOption.value)

  return {
    dataProvider,
    gridOption,
  }
}
