import { watch, reactive, inject } from 'vue'
import { AjaxDataProvider } from '../../data-providers'
import useOption from './useOption'

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
