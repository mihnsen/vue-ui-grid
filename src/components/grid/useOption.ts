import { inject } from 'vue'
import type GridOption from '../../interfaces/grid-option'

export default function(props): any {
  const vGridOptions = inject('$vgrid', {
    debug: false,
    pageKey: 'page',
  })

  return {
    debug: vGridOptions.debug,

    pageKey: vGridOptions.pageKey,

    searchable: props.searchable,
    searchField: props.searchField,
    orderable: props.orderable,
    filterable: props.filterable,
    columnFilterable: props.columnFilterable,
    columnVisible: props.columnVisible,
    statusable: props.statusable,
    pagination: props.pagination,
    exportable: props.exportable,
    columns: props.columns,
    // limit: limit.value,
  }
}
