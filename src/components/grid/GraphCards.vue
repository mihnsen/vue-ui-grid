<template lang="pug">
extends BasicGrid.pug
block body
  include partials/cards.pug
block search
  GridSearch(
    v-model="where[searchField]",
    :placeholder="searchPlaceholder",
    v-if="searchable"
  )
</template>
<script setup lang="ts">
import useGrid from './useGrid'
import useGraphData from './useGraphData'
import Pagination from '../Pagination.vue'
import ColumnType from '../ColumnType.vue'
import ColumnFilter from '../ColumnFilter.vue'
import GridFilter from '../Filter.vue'
import GridOrder from '../Order.vue'
import PageSize from '../PageSize.vue'
import ColumnsVisibility from '../ColumnsVisibility.vue'
import GridSearch from '../Search.vue'
import GridStatus from '../Status.vue'
import ExportButton from '../ExportButton.vue'

interface Props {
  resource?: string;
  resourceMeta?: string;
  searchField?: string;
  refFilter?: string;

  columns?: Array<ColumnOption>;
  perPage?: number;
  filterable?: boolean;
  columnFilterable?: boolean;
  columnVisible?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  orderable?: boolean;
  sortBy?: string;
  sortType?: string;
  statusable?: boolean;
  pagable?: boolean;
  pagination?: boolean;
  strEmptyFilteredData?: string;
  strEmptyData?: string;
  exportable?: boolean;
  exportFileName?: string;
  colMd?: number;
  colLg?: number;
  colXl?: number;
  routeState?: boolean;
  searchField?: string; // Prepare for GraphGrid + AjaxGrid
}

interface Emits {
  (event: 'data-changed', value: any[]): void
}

const emits = defineEmits<Emits>();
const props = withDefaults(defineProps<Props>(), {
  // resource: '',
  // resourceMeta: '';
  // searchField: '';
  refFilter: '',

  columns: [],

  filterable: true,
  columnFilterable: false,
  columnVisible: false,
  searchable: true,

  orderable: false,

  sortType: 'desc',
  statusable: true,
  pagable: true,
  pagination: true,
  strEmptyFilteredData: 'No data matched',
  strEmptyData: 'Empty data',
  exportable: false,

  colMd: 6,
  colLg: 4,
  colXl: 3,
  routeState: false,
})

const {
  gridOption,
  dataProvider,
} = useGraphData(props, { displayType: 'cards', dataType: 'graph' })

const {
  routeGridState,
  hasColumnFilter,
  hasColumnOrder,
  cardColumnClasses,
  dataState,
  hasRecord,
  isLoading,
  columnVisibility,
  hasSortType,
  pageSizes,
  dataQuery,
  isEmptyData,
  visibleCols,
  gridClasses,
  setColumnVisibility,
  initialState,
  gridstate,
  currentState,
  isFiltered,
  onRouteGridStateChanged,
  currentPage,
  searchKeyword,
  order,
  where,
  limit,
  getData,
  setOrder,
  resetState,
  resetGrid,
  updateRouteIfNeeded,
} = useGrid(props, emits, dataProvider, gridOption)

// Kick it off
setColumnVisibility()
getData()
</script>
