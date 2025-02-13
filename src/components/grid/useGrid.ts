import { computed, reactive, ref, watch, inject } from 'vue'
import { useGridHeader } from '@/utilities/filters';
import type Order from '../../interfaces/order'
import type GridOption from '../../interfaces/grid-option'
import type GridState from '../../interfaces/grid-state'
import type DataState from '../../interfaces/data-state'
import type ColumnOption from '../../interfaces/column-option'
import type DataResponse from '../../interfaces/data-response'
import useRouteState from './useRouteState'

export default function(props, emits, dataProvider, gridOption) {
  const vGridOptions = inject('$vgrid', {
    debug: false,
    routerKey: null,
    perPage: 10,
    pageSizes: [5, 10, 20, 50, 100],
    hasSortType: true,
  })
  let routeGridParams = {}
  let updateRouteIfNeeded = (query): any => ({}) // eslint-disable-line
  let queryGridState = computed(() => ({}))

  if (props.routeState && vGridOptions.routerKey) {
    const router = inject(vGridOptions.routerKey)
    const useRouteStateInstance = useRouteState(router, props)
    routeGridParams = useRouteStateInstance.routeGridParams
    updateRouteIfNeeded = useRouteStateInstance.updateRouteIfNeeded
    queryGridState = useRouteStateInstance.queryGridState
  }

  const hasColumnFilter = computed(() => {
    return props.columns.some(c => c.filter)
  })
  const hasColumnOrder = computed(() => {
    return props.columns.some(c => c.order)
  })
  const cardColumnClasses = computed(() => {
    return [
      `vgrid-col-md-${ props.colMd }`,
      `vgrid-col-lg-${ props.colLg }`,
      `vgrid-col-xl-${ props.colXl }`
    ]
  })

  // Define data state
  const DefaultDataState: DataState = {
    records: [],
    total: 0,
  }
  const dataState = reactive(DefaultDataState)

  // Attributes
  const defaultDataQuery: any = ''
  const gridState = reactive({
    isLoading: false,
    searchKeyword: '',
    currentPage: 0,
    limit: props.perPage ? props.perPage : vGridOptions.perPage,
    pageSizes: vGridOptions.pageSizes ,
    order: {
      by: props.sortBy,
      type: props.sortType
    },
    where: {},
    hasSortType: vGridOptions.hasSortType,
    gridstate: new Date().getTime(),
    query: defaultDataQuery, // Current query to get data
    ...routeGridParams
  })

  // Param state on Url
  const paramsState = computed(() => {
    let params: any = {
      [gridOption.searchField]: gridState.searchKeyword,
      limit: gridState.limit
    }

    if (gridOption.pageKey) {
      params[gridOption.pageKey] = gridState.currentPage
    }

    if (props.orderable && gridState.order && gridState.order.by) {
      params.order = gridState.order.by
      params.order_type = gridState.order.type
    }

    const whereParams = Object.keys(gridState.where).reduce((acc, curr) => ({
      ...acc,
      [curr]: gridState.where[curr],
    }), {})

    params = {
      ...params,
      ...whereParams,
      gridstate: gridState.time
    }

    return params
  })

  const hasRecord = computed(() => dataState.records.length > 0)
  const columnVisibility = ref<any>([])
  const getHeaderColumnClasses = (column: any) => {
    const type = column.type || 'text'
    const { field } = column
    const classes = [`vgrid-column-type--${type}`, `vgrid-column-data--${field}`]
    if (column.width) {
      classes.push(`vgrid-field--${column.width}`)
    }
    if (column.class) {
      classes.push(column.class)
    }
    return classes
  }
  const isEmptyData = computed(() => {
    return !dataState.records.length
  })
  const visibleCols = computed(() => {
    return props.columns
      .filter((c: ColumnOption) => columnVisibility.value.includes(c.field))
      .sort((a: ColumnOption, b: ColumnOption) =>
        columnVisibility.value.indexOf(a.field) -
        columnVisibility.value.indexOf(b.field)
      )
      .map((c) => ({
        ...c,
        headerClasses: getHeaderColumnClasses(c),
        orderClasses: getOrderableColumnClasses(c),
        columnClasses: getColumnClasses(c),
        showedLabel: useGridHeader(c.label || c.field)
      }))
  })
  const gridClasses = computed(() => {
    return [`vgrid-${gridOption.displayType}`, `vgrid-${gridOption.dataType}`]
  })
  const setColumnVisibility = () => {
    columnVisibility.value = props.columns
      .filter((c) => c.type !== 'hidden') // Hidden type
      .filter((c) => !c.hidden) // Hidden by default
      .map((c) => c.field)
  }
  const getColumnClasses = (column) => {
    if (column.order !== false && column.type !== 'custom') {
      if (column.field === gridState.order.by) {
        return 'ordering'
      }
    }

    return ''
  }
  const isFiltered = computed(() => {
    let flag = false
    Object.keys(gridState.where).forEach((key) => {
      flag = flag || !!gridState.where[key]
    })
    return flag
  })

  const getData = () => {
    if (vGridOptions.debug) {
      console.log('vgrid - start get data ', gridState.searchKeyword) // eslint-disable-line
    }
    if (!dataProvider) {
      console.log('vgrid - Your grid is not config any data provider') // eslint-disable-line
      return
    }
    gridState.isLoading = true;
    dataProvider
      .getData(gridState.currentPage, gridState.limit, gridState.searchKeyword, gridState.where, gridState.order)
      .then(({ items, total: totalRecord, meta, query }: DataResponse) => {
        dataState.records = items
        dataState.total = totalRecord
        gridState.meta = meta
        gridState.query = query
      })
      .catch((error: any) => {
        if (error) {
          gridState.query = error.query
        }
        console.log('vgrid error', error) // eslint-disable-line
      })
      .then(() => {
        setTimeout(() => {
          gridState.isLoading = false
          emits('data-changed', dataState.records)
        }, 250) // Delay 250ms
      })
  }
  const setOrder = (field: string) => {
    const column: ColumnOption = props.columns.find( (c) => c.field === field)
    if (column && column.order && column.type !== 'custom') {
      if (gridState.order.by === field) {
        if (gridState.hasSortType) {
          gridState.order.type = gridState.order.type === 'desc' ? 'asc' : 'desc'
        }
      } else {
        gridState.order.by = field
        gridState.order.type = 'desc'
      }
    }
  }
  const getOrderableColumnClasses = (column: any) => {
    const classes: string[] = []
    if (column.order && column.type !== 'custom') {
      classes.push('orderable')
      if (column.field === gridState.order.by) {
        classes.push(`${gridState.order.type}`)
      }
    }
    return classes
  }
  const resetPageIndex = () => {
    gridState.currentPage = 0
  }
  const resetGrid = () => {
    gridState.currentPage = 0
    gridState.limit = props.perPage ? props.perPage : vGridOptions.perPage
    gridState.searchKeyword = ''
    gridState.order = {
      by: props.sortBy,
      type: props.sortType
    }
    gridState.gridstate = new Date().getTime();
    gridState.where = {}
  }

  watch(
    () => props.columns,
    () => {
      columnVisibility.value = props.columns
        .filter((c) => c.type !== 'hidden') // Hidden type
        .filter((c) => !c.hidden) // Hidden by default
        .map(c => c.field)
    }
  )
  watch(
    [
      () => gridState.where,
      () => gridState.searchKeyword,
      () => gridState.limit
    ],
    () => {
      resetPageIndex()
    },
    { deep: true }
  )
  // TODO Check
  watch(
    () => paramsState.value,
    (newVal) => {
      getData()
      updateRouteIfNeeded(newVal)
    },
    { deep: true }
  )
  watch(
    () => queryGridState.value,
    (newVal: any, oldVal: any) => {
      if (oldVal && !newVal) {
        resetGrid()
      }
    }
  )

  return {
    hasColumnFilter,
    hasColumnOrder,
    cardColumnClasses,
    dataState,
    hasRecord,
    columnVisibility,
    isEmptyData,
    visibleCols,
    gridClasses,
    setColumnVisibility,
    gridState,
    isFiltered,
    getData,
    setOrder,
    resetGrid
  }
}
