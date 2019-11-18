<template lang="pug">
.vgrid
  .vgrid-header
    slot(name="header-start")
    GridSearch(
      v-model="searchKeyword",
      v-if="searchable"
    )
    GridFilter(
      v-if="filterable && hasColumnFilter",
      v-model="where",
      :columns="columns"
    )
    GridOrder.vgrid-ml-auto(
      v-if="orderable && hasColumnOrder",
      v-model="order",
      :columns="columns"
    )
    ColumnsVisibility.vgrid-ml-auto(
      v-if="columnVisible"
      :columns="columns",
      v-model="columnVisibility",
    )
    slot(name="header-end")
  .vgrid-body.vgrid-responsive
    table.vgrid-table.vgrid-striped.vgrid-bordered
      thead
        tr
          th(
            v-for="col in visibleCols",
            @click="setOrder(col.field)",
            :class="headerColumnClasses[col.field]"
            :key="col.id"
          )
            span {{ (col.label || col.field) | vgrid_header }}
      tbody
        tr.vgrid-table-filter(
          v-if="columnFilterable && hasColumnFilter"
        )
          td(
            v-for="col in visibleCols",
            :key="col.field",
          )
            ColumnFilter(
              :column="col",
              v-model="where[col.field]",
            )
        tr.vgrid-nodata(
          v-if="!totalFiltered",
        )
          td(
            :colspan="visibleCols.length"
          )
            span(v-if="!total") {{ strEmptyData }}
            span(v-else) {{ strEmptyFilteredData }}
        tr(
          v-for="entry in showedData",
        )
          slot(
            :entry="entry",
            :visible-cols="visibleCols"
          )
            td(
              v-for="col in visibleCols",
              :key="col.field"
            )
              ColumnType(
                :column="col",
                :data="entry",
                :key="col.id",
                :class="columnClasses[col.field]",
              )
                slot(:name="'column-' + col.field", :entry="entry")
  .vgrid-footer
    PageSize(
      v-if="pagination",
      v-model="limit"
    )
    GridStatus(
      :v-if="status",
      :limit="limit",
      :current-page="currentPage",
      :showed="showedData.length",
      :total="totalFiltered"
    )
    Pagination(
      v-if="pagination",
      v-model="currentPage",
      :limit="limit",
      :total="totalFiltered",
    )
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Pagination from './components/Pagination.vue'
import ColumnType from './components/ColumnType.vue'
import ColumnFilter from './components/ColumnFilter.vue'
import GridFilter from './components/Filter.vue'
import GridOrder from './components/Order.vue'
import PageSize from './components/PageSize.vue'
import ColumnsVisibility from './components/ColumnsVisibility.vue'
import GridSearch from './components/Search.vue'
import GridStatus from './components/Status.vue'
import Order from './interfaces/order'

interface Where {
  [key: string]: string
}

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
    GridStatus
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
  @Prop({ required: true, default: () => ([]) })
  data!: any[]

  @Prop({ required: true, default: () => ([]) })
  columns!: any[]

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

  @Prop({ default: false })
  orderable!: boolean

  @Prop({ default: true })
  status!: boolean

  @Prop({ default: true })
  pagination!: boolean

  @Prop({ default: 'No data matched' })
  strEmptyFilteredData!: string

  @Prop({ default: 'Empty data' })
  strEmptyData!: string

  currentPage = this.index
  searchKeyword: string = ''
  limit: number = this.perPage

  order: Order = { by: '', type: 'desc' }
  where: Where = {}

  columnVisibility = this.columns
    .filter((c) => c.type !== 'hidden') // Hidden type
    .filter((c) => !c.hidden) // Hidden by default
    .map(c => c.field)

  get searchedData() {
    let searched = [...this.data.filter((r) => r)]

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

  get total() {
    return this.data.length
  }

  get totalFiltered() {
    return this.filteredData.length
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

  get headerColumnClasses(): string[] {
    const result = []

    // eslint-disable-next-line
    for (const item of this.visibleCols) {
      if (item.order && item.type !== 'custom') {
        let classes = 'orderable'

        if (item.field === this.order.by) {
          classes += ` ${this.order.type}`
        }

        result[item.field] = classes
      }

      if (item.type === 'custom') {
        result[item.field] = item.field
      }
    }

    return result
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

  setOrder(field: string) {
    const column = this.columns.find((c) => c.field === field)

    if (column.order && column.type !== 'custom') {
      if (this.order.by === field) {
        this.order.type = this.order.type === 'desc' ? 'asc' : 'desc'
      } else {
        this.order.by = field
        this.order.type = 'desc'
      }
    }
  }
}
</script>

<style lang="scss">
@import './assets/scss/index'
</style>
