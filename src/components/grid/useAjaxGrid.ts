import { watch, reactive, inject } from 'vue'
import { AjaxDataProvider } from '../../data-providers'

export default function(props, option, dataCallback) {
  const vGridOptions = inject('$vgrid', {})

  const ajaxOptions = {
    resource: props.resource,
    searchField: props.searchField,
    pageKey: vGridOptions.pageKey,
    perPageKey: vGridOptions.perPageKey,
    sortKey: vGridOptions.sortKey,
    sortTypeKey: vGridOptions.sortTypeKey,
    getPageIndex: vGridOptions.getPageIndex,
    extractData: vGridOptions.extractData,
    fetchData: vGridOptions.fetchData,
    cancelToken: vGridOptions.cancelToken
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
    ...ajaxOptions,
    ...option,
  })
  const dataProvider = new AjaxDataProvider(props.resource, gridOption)

  return {
    dataProvider,
    gridOption,
  }
}
