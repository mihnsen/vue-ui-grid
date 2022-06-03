import { inject } from 'vue'
import type GridOption from '../../interfaces/grid-option'

export default function(props): any {
  const vGridOptions = inject('$vgrid', {
    debug: false,
  })

  return {
    debug: vGridOptions.debug,
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
  }
}
