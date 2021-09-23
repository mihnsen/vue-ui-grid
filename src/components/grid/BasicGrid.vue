<template lang="pug">
include BasicGrid.pug
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
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
import Order from '../../interfaces/order'
import { JsonDataProvider } from '../../data-providers'
import GridOption from '../../interfaces/grid-option'
import GridState from '../../interfaces/grid-state'
import ColumnOption from '../../interfaces/column-option'
import DataResponse from '../../interfaces/data-response'
import IDataProvider from '../../data-providers/abstract'

interface Where {
  [key: string]: string
}

// TODO Customize filter from parent
@Component({
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
    ExportButton
  },
  filters: {
    vgrid_header(str: string) {
      if (str) {
        const s = str.charAt(0).toUpperCase() + str.slice(1)
        return s.replace(/_/, ' ')
      }

      return str
    }
  }
})
export default class VGrid extends Vue {
  @Prop({ default: () => ([]) })
  data!: Array<any>

  @Prop({ required: true, default: () => ([]) })
  columns!: Array<ColumnOption>

  @Prop()
  perPage!: number

  @Prop({ default: true })
  filterable!: boolean

  @Prop({ default: false })
  columnFilterable!: boolean

  @Prop({ default: false })
  columnVisible!: boolean

  @Prop({ default: true })
  searchable!: boolean

  @Prop()
  searchPlaceholder!: string

  @Prop({ default: false })
  orderable!: boolean

  @Prop()
  sortBy!: string

  @Prop({ default: 'desc' })
  sortType!: string

  @Prop({ default: true })
  statusable!: boolean

  @Prop({ default: true })
  pagable!: boolean

  @Prop({ default: true })
  pagination!: boolean

  @Prop({ default: 'No data matched' })
  strEmptyFilteredData!: string

  @Prop({ default: 'Empty data' })
  strEmptyData!: string

  @Prop({ default: false })
  exportable!: boolean

  @Prop()
  exportFileName!: string

  // For cards
  @Prop({ default: 6 })
  colMd!: number

  @Prop({ default: 4 })
  colLg!: number

  @Prop({ default: 3 })
  colXl!: number

  @Prop({ default: false })
  routeState!: boolean

  @Prop()
  searchField!: string // Prepare for GraphGrid + AjaxGrid

  @Watch('columns')
  setColumnVisibility() {
    this.columnVisibility = this.columns
      .filter((c) => c.type !== 'hidden') // Hidden type
      .filter((c) => !c.hidden) // Hidden by default
      .map(c => c.field)
  }

  @Watch('where', { deep: true })
  @Watch('searchKeyword')
  @Watch('limit')
  onStateChange() {
    this.resetState()
  }

  @Watch('data')
  setDataCollections() {
    if (this.dataProvider instanceof JsonDataProvider) {
      this.dataProvider.updateData(this.data)
      this.getData()
    }
  }

  @Watch('currentState', { deep: true })
  onCurrentStateParamsChanged() {
    this.getData()
    this.updateRouteIfNeeded()
  }

  @Watch('routeGridState')
  onRouteGridStateChanged(newVal: any, oldVal: any) {
    if (oldVal && !newVal) {
      this.resetGrid()
    }
  }

  // Attributes
  initialState: GridState = this.getStateFromRouteIfNeeded()
  debug: boolean = this.$vgrid.debug || false
  dataCollections: Array<any> = []
  total: number = 0

  isLoading: boolean = false
  columnVisibility: Array<string> = []
  hasSortType: boolean = this.$vgrid.hasSortType || true

  currentPage: number = this.initialState.currentPage || 0
  searchKeyword: string = this.initialState.searchKeyword || ''
  order: Order = this.initialState.order
    ? this.initialState.order
    : { by: this.sortBy, type: this.sortType }
  where: Where = this.initialState.where ? this.initialState.where : {}
  // @ts-ignore
  limit: number = this.initialState.limit
    ? this.initialState.limit
    : this.perPage ? this.perPage : (this.$vgrid.perPage || 10)

  // @ts-ignore
  pageSizes: Array<number> = this.$vgrid.pageSizes || [5, 10, 20, 50, 100]

  displayType: string = 'grid'
  dataType: string = 'js'
  dataQuery: any = ''

  dataProvider: IDataProvider | null = null

  get gridstate() {
    return this.initialState.gridstate
  }

  get routeGridState() {
    if (this.routeState) {
      const query = this.$route.query

      if (query.gridstate) {
        return query.gridstate
      }
    }

    return null
  }

  get currentState() {
    let state: any = {
      s: this.searchKeyword,
      page: this.currentPage,
      limit: this.limit
    }

    if (this.order && this.order.by) {
      state.order = this.order.by
      state.order_type = this.order.type
    }

    state = Object.keys(this.where).reduce((acc, curr) => ({
      ...acc,
      [curr]: this.where[curr]
    }), state)

    // Put a state to it
    state.gridstate = this.gridstate

    return state
  }

  get gridOption(): GridOption {
    return {
      searchable: this.searchable,
      orderable: this.orderable,
      filterable: this.filterable,
      columnFilterable: this.columnFilterable,
      columnVisible: this.columnVisible,
      statusable: this.statusable,
      pagination: this.pagination,
      exportable: this.exportable,
      columns: this.columns,
      limit: this.limit,
      ...this.extraGridOption
    }
  }

  get extraGridOption() {
    return {}
  }

  get showedData() {
    return this.dataCollections
  }

  get isEmptyData() {
    return !this.dataCollections.length
  }

  get hasColumnFilter() {
    return this.columns.some((c) => c.filter)
  }

  get hasColumnOrder() {
    return this.columns.some((c) => c.order)
  }

  get visibleCols() {
    return this.columns.filter((c) => this.columnVisibility.includes(c.field))
      .sort(
        (a, b) =>
          (
            this.columnVisibility.indexOf(a.field) -
            this.columnVisibility.indexOf(b.field)
          )
      )
  }

  get columnClasses() {
    const result: any = []

    // eslint-disable-next-line
    for (const item of this.visibleCols) {
      if (item.order !== false && item.type !== 'custom') {
        if (item.field === this.order.by) {
          result[item.field] = 'ordering'
        }
      }
    }

    return result
  }

  get isFiltered() {
    let flag = false

    Object.keys(this.where).forEach((key) => {
      flag = flag || !!this.where[key]
    })

    return flag
  }

  get gridClasses() {
    return [
      `vgrid-${this.displayType}`,
      `vgrid-${this.dataType}`
    ]
  }

  get cardColumnClasses() {
    return [
      `vgrid-col-md-${this.colMd}`,
      `vgrid-col-lg-${this.colLg}`,
      `vgrid-col-xl-${this.colXl}`
    ]
  }

  created() {
    this.initProvider()
    this.setColumnVisibility()
    this.setDataCollections()

    // First action
    this.getData()
  }

  initProvider() {
    this.dataProvider = new JsonDataProvider(this.data, this.gridOption)
  }

  getData() {
    if (this.debug) {
      console.log('vgrid - start get data ', this.searchKeyword) // eslint-disable-line
    }

    if (!this.dataProvider) {
      console.log('vgrid - Your grid is not config any data provider') // eslint-disable-line
      return
    }

    this.isLoading = true
    this.dataProvider.getData(
      this.currentPage,
      this.limit,
      this.searchKeyword,
      this.where,
      this.order
    )
      .then(({ items, total, query }: DataResponse) => {
        this.dataCollections = items
        this.total = total
        this.dataQuery = query
      })
      .catch((error: any) => {
        if (error) {
          this.dataQuery = error.query
        }

        console.log('vgrid error', error) // eslint-disable-line
      })
      .then(() => {
        setTimeout(() => {
          this.isLoading = false
          this.$emit('data-changed', this.dataCollections)
        }, 250) // Delay 250ms
      })
  }

  setOrder(field: string) {
    const column: ColumnOption | undefined = this.columns.find((c) => c.field === field)

    if (column && column.order && column.type !== 'custom') {
      if (this.order.by === field) {
        if (this.hasSortType) {
          this.order.type = this.order.type === 'desc' ? 'asc' : 'desc'
        }
      } else {
        this.order.by = field
        this.order.type = 'desc'
      }
    }
  }

  headerColumnClasses(column: any) {
    const type = column.type || 'text'
    const { field } = column

    const classes = [
      `column-type-${type}`,
      `column-data-${field}`
    ]

    if (column.width) {
      classes.push(`vgrid-field-${column.width}`)
    }

    if (column.class) {
      classes.push(column.class)
    }

    return classes
  }

  orderableColumnClasses(column: any) {
    const classes = []

    if (column.order && column.type !== 'custom') {
      classes.push('orderable')

      if (column.field === this.order.by) {
        classes.push(`${this.order.type}`)
      }
    }

    return classes
  }

  resetState() {
    this.currentPage = 0
  }

  resetGrid() {
    this.initialState = {
      ...this.initialState,
      gridstate: (new Date()).getTime()
    }
    this.currentPage = 0
    this.searchKeyword = ''
    this.order = { by: this.sortBy, type: this.sortType }
    this.where = {}
  }

  updateRouteIfNeeded() {
    if (!this.routeState) {
      return
    }

    const newQuery = {
      ...this.$route.query,
      ...this.currentState
    }
    this.$router.replace({ query: newQuery })
  }

  getStateFromRouteIfNeeded() {
    let state : any = {}

    if (this.routeState) {
      const query : any = this.$route.query || {}

      if (query.gridstate) {
        state.gridstate = query.gridstate
      } else {
        state.gridstate = (new Date()).getTime()
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
          type: query.order_type || 'desc'
        }
      }

      let filter : any = {}

      if (this.searchField && query[this.searchField]) {
        filter[this.searchField] = query[this.searchField]
      }

      Object.keys(query).forEach((key) => {
        const column = this.columns.find(c => c.field === key)
        if (column && column.filter) {
          filter[key] = query[key]
        }
      })

      state.where = filter
    }

    return state
  }
}
</script>
