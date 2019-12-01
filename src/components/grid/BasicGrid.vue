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
  columns!: Array<any>

  @Prop({ default: 10 })
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
  status!: boolean

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
  @Prop({ default: 2 })
  colMd!: number

  @Prop({ default: 3 })
  colLg!: number

  @Prop({ default: 4 })
  colXl!: number

  @Watch('columns')
  setColumnVisibility() {
    this.columnVisibility = this.columns
      .filter((c) => c.type !== 'hidden') // Hidden type
      .filter((c) => !c.hidden) // Hidden by default
      .map(c => c.field)
  }

  @Watch('where', { immediate: true, deep: true })
  updateGridAfterQueryChanged() {
    this.resetState()
  }

  @Watch('searchKeyword')
  updateGridAfterSearchChanged() {
    this.resetState()
  }

  @Watch('data')
  setDataCollections() {
    this.dataCollections = this.data

    this.$nextTick(() => {
      this.total = this.filteredData.length
    })
  }

  // Attributes
  dataCollections: Array<any> = []
  total: number = 0
  currentPage = this.index
  searchKeyword: string = ''
  limit: number = this.perPage
  isLoading: boolean = false
  order: Order = { by: this.sortBy, type: this.sortType }
  where: Where = {}
  columnVisibility: Array<string> = []
  hasOrderType: boolean = true

  displayType: string = 'grid'
  dataType: string = 'js'

  get searchedData() {
    let searched = [...this.dataCollections.filter((r) => r)]

    if (this.searchKeyword) {
      const re = new RegExp(this.searchKeyword, 'gi')

      searched = searched.filter((d) => {
        let matched = false

        this.columns.forEach((c) => {
          if (re.test(`${d[c.field]}`)) {
            matched = true
          }
        })

        return matched
      })
    }

    return searched
  }

  get filteredData() {
    let filtered = this.searchedData

    Object.keys(this.where).map((key) => {
      const re = new RegExp(this.where[key], 'gi')

      filtered = filtered.filter((d) => re.test(d[key]))
    })

    return filtered
  }

  get sortedData() {
    const column = this.columns.find((c) => c.field === this.order.by)
    let sortedData = this.filteredData

    if (column) {
      sortedData = sortedData.sort((a: any, b: any) => {
        let field = b[column.field]
        let compareField = a[column.field]

        if (this.order.type === 'desc') {
          field = a[column.field]
          compareField = b[column.field]
        }

        if (column.type === 'number') {
          return field - compareField
        }

        if (typeof field === 'string') {
          return field.localeCompare(compareField)
        }

        return 0
      })
    }

    return sortedData
  }

  get showedData() { // Or paginatedData
    let showedData = this.sortedData

    if (this.pagination) {
      if (this.sortedData.length > this.limit) {
        showedData = this.sortedData.slice(
          this.limit * this.currentPage,
          this.limit * (this.currentPage + 1)
        )
      }
    }

    return showedData
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
    const result = []

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
    return this.filteredData.length !== this.dataCollections.length
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
    this.setColumnVisibility()
    this.setDataCollections()
  }

  setOrder(field: string) {
    const column = this.columns.find((c) => c.field === field)

    if (column.order && column.type !== 'custom') {
      if (this.order.by === field) {
        if (this.hasOrderType) {
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

    if (column.order && column.type !== 'custom') {
      classes.push('orderable')

      if (column.field === this.order.by) {
        classes.push(`${this.order.type}`)
      }
    }

    if (column.class) {
      classes.push(column.class)
    }

    return classes
  }

  resetState() {
    this.currentPage = 0
  }
}
</script>
