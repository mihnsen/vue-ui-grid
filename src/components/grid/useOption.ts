import { inject } from 'vue'
import GridOption from '../../interfaces/grid-option'

export default function(props): GridOption {
  const vGridOptions = inject('$vgrid', {})

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
