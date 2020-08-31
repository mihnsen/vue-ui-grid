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

  @Prop({ default: 0 })
  index!: number

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

  @Watch('columns')
  setColumnVisibility() {
    this.columnVisibility = this.columns
      .filter((c) => c.type !== 'hidden') // Hidden type
      .filter((c) => !c.hidden) // Hidden by default
      .map(c => c.field)
  }

  @Watch('where', { deep: true })
  updateGridAfterQueryChanged() {
    this.resetState()
  }

  @Watch('searchKeyword')
  updateGridAfterSearchChanged() {
    this.resetState()
  }

  @Watch('data')
  setDataCollections() {
    if (this.dataProvider instanceof JsonDataProvider) {
      this.dataProvider.updateData(this.data)
      this.getData()
    }
  }

  @Watch('limit') // Items per page
  onChangeLimit() {
    this.resetState()
  }

  @Watch('searchKeyword')
  @Watch('currentPage')
  @Watch('order', { deep: true })
  onStateChanged() {
    this.getData()
  }

  // Attributes
  debug: boolean = this.$vgrid.debug || false
  dataCollections: Array<any> = []
  total: number = 0
  currentPage = this.index
  searchKeyword: string = ''

  isLoading: boolean = false
  order: Order = { by: this.sortBy, type: this.sortType }
  where: Where = {}
  columnVisibility: Array<string> = []
  hasSortType: boolean = this.$vgrid.hasSortType || true

  // @ts-ignore
  limit: number = this.perPage ? this.perPage : (this.$vgrid.perPage || 10)

  // @ts-ignore
  pageSizes: Array<number> = this.$vgrid.pageSizes || [5, 10, 20, 50, 100]

  displayType: string = 'grid'
  dataType: string = 'js'
  dataQuery: any = ''

  dataProvider: IDataProvider | null = null

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
    return this.visibleCols.some((c) => c.filter)
  }

  get hasColumnOrder() {
    return this.visibleCols.some((c) => c.order)
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
    if (!this.dataProvider) {
      console.log('Your grid is not config any data provider') // eslint-disable-line
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
        if (error.query) {
          this.dataQuery = error.query
        }

        console.log(error) // eslint-disable-line
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
    this.getData()
  }
}
</script>
