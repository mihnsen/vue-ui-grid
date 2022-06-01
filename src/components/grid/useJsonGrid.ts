import { watch, reactive } from 'vue'
import { JsonDataProvider } from '../../data-providers'

export default function(props, dataCallback) {
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
  })
  const dataProvider = new JsonDataProvider(props.data, gridOption)
  const setDataCollections = () => {
    dataProvider.updateData(props.data)
    dataCallback()
    // TODO getData
    // getData()
  }

  watch(
    () => props.data,
    () => {
      setDataCollections()
    },
  )

  return {
    dataProvider,
    gridOption,
    setDataCollections,
  }
}
