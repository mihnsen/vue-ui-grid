<template lang="pug">
include BasicGrid.pug
</template>
<script lang="ts">
import { defineComponent, computed, reactive, ref, watch, inject } from 'vue'

import Order from '../../interfaces/order'
import { JsonDataProvider } from '../../data-providers'
import GridOption from '../../interfaces/grid-option'
import GridState from '../../interfaces/grid-state'
import ColumnOption from '../../interfaces/column-option'
import DataResponse from '../../interfaces/data-response'

import { useGridHeader } from '@/utilities/filters';

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

interface Where {
  [key: string]: string
}

export default defineComponent({
  inject: ['vgrid'],
  props: {
    data: { default: () => [] },
    columns: { required: true, default: () => [] },
    filterable: { default: true },
    columnFilterable: { default: false },
    columnVisible: { default: false },
    searchable: { default: true },
    orderable: { default: false },
    sortType: { default: 'desc' },
    statusable: { default: true },
    pagable: { default: true },
    pagination: { default: true },
    strEmptyFilteredData: { default: 'No data matched' },
    strEmptyData: { default: 'Empty data' },
    exportable: { default: false },
    // For cards
    colMd: { default: 6 },
    colLg: { default: 4 },
    colXl: { default: 3 },
    routeState: { default: false },
  },
  name: 'VGrid',
  components: {
    Pagination,
    ColumnType,
    ColumnFilter,
    GridFilter,
    GridOrder,
    PageSize,
    ColumnsVisibility,
    GridSearch,
    GridStatus,
    ExportButton,
  },
  setup(props, context) {
    const vGridOptions = inject('$vgrid', {})

    const routeGridState = computed(() => {
      // if (props.routeState) {
      //   const query = this.$route.query
      //   if (query.gridstate) {
      //     return query.gridstate
      //   }
      // }
      return null
    })
    const extraGridOption = computed(() => {
      return {}
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
    const debug = reactive(vGridOptions.debug || false)
    let dataCollections = reactive({
      records: [],
    })
    let total = ref(0)
    let isLoading = ref(false)
    let columnVisibility = ref([])
    const hasSortType = reactive(vGridOptions.hasSortType || true)
    // @ts-ignore
    const pageSizes = reactive(vGridOptions.pageSizes || [5, 10, 20, 50, 100])
    const displayType = ref('grid')
    const dataType = ref('js')
    const dataQuery = ref('')
    const dataProvider = ref(null)
    const getHeaderColumnClasses = (column: any) => {
      const type = column.type || 'text'
      const { field } = column
      const classes = [`column-type-${type}`, `column-data-${field}`]
      if (column.width) {
        classes.push(`vgrid-field-${column.width}`)
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
    const showedData = computed(() => {
      return dataCollections.records
    })
    const isEmptyData = computed(() => {
      return !dataCollections.records.length
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
      return [`vgrid-${displayType.value}`, `vgrid-${dataType.value}`]
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
    const gridOption = computed(() => {
      return {
        searchable: props.searchable,
        orderable: props.orderable,
        filterable: props.filterable,
        columnFilterable: props.columnFilterable,
        columnVisible: props.columnVisible,
        statusable: props.statusable,
        pagination: props.pagination,
        exportable: props.exportable,
        columns: props.columns,
        limit: limit.value,
        ...extraGridOption.value,
      }
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
      () => where,
      () => {
        resetState()
      },
      { deep: true }
    )
    watch(
      () => props.data,
      () => {
        setDataCollections()
      },
    )
    watch(
      () => currentState.value,
      () => {
        getData()
        updateRouteIfNeeded()
      },
      { deep: true }
    )

    const setDataCollections = () => {
      if (dataProvider.value instanceof JsonDataProvider) {
        dataProvider.value.updateData(props.data)
        getData()
      }
    }
    const initProvider = () => {
      dataProvider.value = new JsonDataProvider(props.data, gridOption.value)
    }
    const getData = () => {
      if (debug) {
        console.log('vgrid - start get data ', searchKeyword.value) // eslint-disable-line
      }
      if (!dataProvider.value) {
        console.log('vgrid - Your grid is not config any data provider') // eslint-disable-line
        return
      }
      isLoading.value = true
      dataProvider.value
        .getData(currentPage.value, limit.value, searchKeyword.value, where, order)
        .then(({ items, total: totalRecord, query }: DataResponse) => {
          dataCollections.records = items
          total.value = totalRecord
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
            context.emit('data-changed', dataCollections.records)
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

    // Init first action
    initProvider()
    setColumnVisibility()
    setDataCollections()
    getData()

    // TODO: Please remove unused return variable
    return {
      routeGridState,
      extraGridOption,
      hasColumnFilter,
      hasColumnOrder,
      cardColumnClasses,
      debug,
      dataCollections,
      total,
      isLoading,
      columnVisibility,
      hasSortType,
      pageSizes,
      displayType,
      dataType,
      dataQuery,
      dataProvider,
      getStateFromRouteIfNeeded,
      showedData,
      isEmptyData,
      visibleCols,
      gridClasses,
      setColumnVisibility,
      initialState,
      gridstate,
      currentState,
      gridOption,
      isFiltered,
      where,
      setDataCollections,
      currentState,
      onRouteGridStateChanged,
      currentPage,
      searchKeyword,
      order,
      where,
      limit,
      initProvider,
      getData,
      setOrder,
      resetState,
      resetGrid,
      updateRouteIfNeeded,
    }
  },
})
</script>
