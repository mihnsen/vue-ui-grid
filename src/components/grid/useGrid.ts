import { computed, reactive, ref, watch, inject } from 'vue'
import { useGridHeader } from '@/utilities/filters';
import Order from '../../interfaces/order'
import GridOption from '../../interfaces/grid-option'
import GridState from '../../interfaces/grid-state'
import ColumnOption from '../../interfaces/column-option'
import DataResponse from '../../interfaces/data-response'

export default function(props, emits, dataProvider, gridOption) {
  const vGridOptions = inject('$vgrid', {})
  const routeGridState = computed(() => {
    if (props.routeState) {
      const query = this.$route.query
      if (query.gridstate) {
        return query.gridstate
      }
    }
    return null
  })
  const hasColumnFilter = computed(() => {
    return props.columns.some(
      (c) => c.filter
    )
  })
  const hasColumnOrder = computed(() => {
    return props.columns.some(
      (c) => c.order
    )
  })
  const cardColumnClasses = computed(() => {
    return [
      `vgrid-col-md-${ props.colMd }`,
      `vgrid-col-lg-${ props.colLg }`,
      `vgrid-col-xl-${ props.colXl }`,
    ]
  })
  const dataState = reactive({
    records: [],
    total: 0,
  })
  const hasRecord = computed(() => dataState.records.length > 0)
  let isLoading = ref(false)
  let columnVisibility = ref([])
  const hasSortType = reactive(vGridOptions.hasSortType || true)
  const pageSizes = reactive(vGridOptions.pageSizes || [5, 10, 20, 50, 100])
  const dataQuery = ref('')
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
  const getStateFromRouteIfNeeded = () => {
    let state: any = {}
    if (props.routeState) {
      const query: any = /*this.$route.query ||*/ {}
      if (query.gridstate) {
        state.gridstate = query.gridstate
      } else {
        state.gridstate = new Date().getTime()
      }
      if (query.s) {
        state.searchKeyword = query.s
      }
      if (query.page) {
        state.currentPage = parseInt(query.page, 10)
      }
      if (query.limit) {
        state.limit = parseInt(query.limit, 10)
      }
      if (query.order) {
        state.order = {
          by: query.order,
          type: query.order_type || 'desc',
        }
      }
      let filter: any = {}
      if (props.searchField && query[props.searchField]) {
        filter[props.searchField] = query[props.searchField ]
      }
      Object.keys(query).forEach((key) => {
        const column = props.columns.find((c) => c.field === key)
        if (column && column.filter) {
          filter[key] = query[key]
        }
      })
      state.where = filter
    }
    return state
  }
  const isEmptyData = computed(() => {
    return !dataState.records.length
  })
  const visibleCols = computed(() => {
    return props.columns
      .filter((c) => columnVisibility.value.includes(c.field))
      .sort(
        (a, b) =>
          columnVisibility.value.indexOf(a.field) -
          columnVisibility.value.indexOf(b.field)
      )
      .map((c) => ({
        ...c,
        headerClasses: getHeaderColumnClasses(c),
        orderClasses: getOrderableColumnClasses(c),
        columnClasses: getColumnClasses(c),
        showedLabel: useGridHeader(c.label || c.field),
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
  // Attributes
  const initialState = reactive(getStateFromRouteIfNeeded())
  const gridstate = computed(() => {
    return initialState.gridstate
  })
  const currentState = computed(() => {
    let state: any = {
      s: searchKeyword.value,
      page: currentPage.value,
      limit: limit.value,
    }
    if (order && order.by) {
      state.order = order.by
      state.order_type = order.type
    }
    state = Object.keys(where).reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: where[curr],
      }),
      state
    )
    // Put a state to it
    state.gridstate = gridstate.value
    return state
  })
  const getColumnClasses = (column) => {
    if (column.order !== false && column.type !== 'custom') {
      if (column.field === order.by) {
        return 'ordering'
      }
    }

    return ''
  }
  const isFiltered = computed(() => {
    let flag = false
    Object.keys(where).forEach((key) => {
      flag = flag || !!where[key]
    })
    return flag
  })
  const onRouteGridStateChanged = (newVal: any, oldVal: any) => {
    if (oldVal && !newVal) {
      resetGrid()
    }
  }
  const currentPage = ref(initialState.currentPage || 0)
  const searchKeyword = ref(initialState.searchKeyword || '')
  const order = reactive(
    initialState.order
      ? initialState.order
      : {
          by: props.sortBy,
          type: props.sortType,
        }
  )
  const where = reactive(
    initialState.where ? initialState.where : {}
    // @ts-ignore
  )
  // @ts-ignore
  const limit = ref(
    initialState.limit
      ? initialState.limit
      : props.perPage
      ? props.perPage
      : vGridOptions.perPage || 10
    // @ts-ignore
  )

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
    () => where,
    () => {
      resetState()
    },
    { deep: true }
  )
  watch(
    () => currentState.value,
    () => {
      getData()
      updateRouteIfNeeded()
    },
    { deep: true }
  )
  const getData = () => {
    if (vGridOptions.debug) {
      console.log('vgrid - start get data ', searchKeyword.value) // eslint-disable-line
    }
    if (!dataProvider) {
      console.log('vgrid - Your grid is not config any data provider') // eslint-disable-line
      return
    }
    isLoading.value = true
    dataProvider
      .getData(currentPage.value, limit.value, searchKeyword.value, where, order)
      .then(({ items, total: totalRecord, query }: DataResponse) => {
        dataState.records = items
        dataState.total = totalRecord
        dataQuery.value = query
      })
      .catch((error: any) => {
        if (error) {
          dataQuery.value = error.query
        }
        console.log('vgrid error', error) // eslint-disable-line
      })
      .then(() => {
        setTimeout(() => {
          isLoading.value = false
          emits('data-changed', dataState.records)
        }, 250) // Delay 250ms
      })
  }
  const setOrder = (field: string) => {
    const column: ColumnOption = props.columns.find( (c) => c.field === field)
    if (column && column.order && column.type !== 'custom') {
      if (order.by === field) {
        if (hasSortType) {
          order.type = order.type === 'desc' ? 'asc' : 'desc'
        }
      } else {
        order.by = field
        order.type = 'desc'
      }
    }
  }
  const getOrderableColumnClasses = (column: any) => {
    const classes = []
    if (column.order && column.type !== 'custom') {
      classes.push('orderable')
      if (column.field === order.by) {
        classes.push(`${order.type}`)
      }
    }
    return classes
  }
  const resetState = () => {
    currentPage.value = 0
  }
  const resetGrid = () => {
    initialState = {
      ...initialState,
      gridstate: new Date().getTime(),
    };
    currentPage.value = 0
    searchKeyword.value = ''
    order = {
      by: props.sortBy,
      type: props.sortType,
    }
    where = {}
  }
  const updateRouteIfNeeded = () => {
    if (!(props.routeState)) {
      return
    }

    // const newQuery = {
    //   ...this.$route.query,
    //   ...currentState.value,
    // }
    // this.$router.replace(
    //   { query: newQuery }
    // )
  }

  return {
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
  }
}
