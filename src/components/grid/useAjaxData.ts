import { watch, reactive, inject } from 'vue'
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

  const ajaxOptions = {
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
  }

  const gridOption = reactive({
    ...useOption(props),
    ...ajaxOptions,
    ...option,
  })
  const dataProvider = new AjaxDataProvider(props.resource, gridOption)

  return {
    dataProvider,
    gridOption,
  }
}
