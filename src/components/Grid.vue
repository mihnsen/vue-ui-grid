<template lang="pug">
.vgrid
  .vgrid-header
    .vgrid-row
      .vgrid-col
        PageSize(
          v-model="limit",
        )
      .vgrid-col
        GridFilter(
          v-model="searchKeyword",
        )
      .vgrid-col
        ColumnsVisibility(
          v-model="columns",
        )
  .vgrid-body.vgrid-responsive
    table.vgrid.vgrid-striped.vgrid-bordered
      thead
        tr
          th(
            v-for="col in visibleCols",
            @click="order(col.field)",
            :class="headerColumnClasses[col.field]"
            :key="col.id"
          )
            span {{ (col.label || col.field) | vgrid_header }}
      tbody
        tr.vgrid-row-filter(
          :key="keyColumnFilter",
          v-if="columnFilter"
        )
          ColumnFilter(
            v-for="col in visibleCols",
            :column="col",
            :key="col.id",
            v-model="where[col.name]",
            @clear-filter="clearFilter"
          )
        tr(
          v-for="entry in showedData",
        )
          ColumnType(
            v-for="col in visibleCols"
            :column="col",
            :data="entry",
            :key="col.id"
            :class="columnClasses[col.field]",
          )
            slot(:name="'column-' + col.field", :entry="entry")
  .vgrid-footer
    .vgrid-row
      .v-grid-col
        .vgrid-infor {{ paginationInfo }}
      .v-grid-col
        Pagination(
          v-model="currentPage",
          :limit="limit",
          :total="total",
        )
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Pagination from './Pagination.vue'
import ColumnType from './ColumnType.vue'
import ColumnFilter from './ColumnFilter.vue'
import PageSize from './PageSize.vue'
import ColumnsVisibility from './ColumnsVisibility.vue'
import GridFilter from './Filter.vue'

interface Where {
  [key: string]: string
}

@Component({
  components: {
    Pagination,
    ColumnType,
    ColumnFilter,
    PageSize,
    ColumnsVisibility,
    GridFilter
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
export default class Grid extends Vue {
  @Prop({ required: true, default: () => ([]) })
  data!: any[]

  @Prop({ required: true, default: () => ([]) })
  columns!: any[]

  @Prop({ default: 10 })
  perPage!: number

  @Prop({ default: 0 })
  index!: number

  @Prop({ default: true })
  searchable!: boolean

  @Prop({ default: false })
  columnFilter!: boolean

  currentPage = this.index
  searchKeyword: string = ''
  limit: number = this.perPage
  orderBy: string = ''
  orderType: string = 'desc'
  where: Where = {}

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

  get showedData() {
    const column = this.columns.find((c) => c.field === this.orderBy)
    let showedData = this.filteredData

    if (column) {
      showedData = showedData.sort((a: any, b: any) => {
        let field = b[column.field]
        let compareField = a[column.field]

        if (this.orderType === 'desc') {
          field = a[column.field]
          compareField = b[column.field]
        }

        if (column.type === 'number') {
          return field - compareField
        }

        if (typeof field === 'string') {
          return field.localeCompare(compareField)
        }
      })
    }

    if (showedData.length > this.limit) {
      showedData = showedData.slice(
        this.limit * this.currentPage,
        this.limit * (this.currentPage + 1)
      )
    }

    return showedData
  }

  get total() {
    return this.data.length
  }

  get paginationInfo() {
    const from = this.limit * this.currentPage
    const to = from + this.showedData.length
    return `Showing ${from + 1} to ${to} of ${this.total} entries`
  }

  get visibleCols() {
    return this.columns.filter((c) => !c.hidden)
  }

  get headerColumnClasses(): string[] {
    const result = []

    // eslint-disable-next-line
    for (const item of this.visibleCols) {
      if (item.orderable !== false && item.type !== 'custom') {
        let classes = 'orderable '

        if (item.field === this.orderBy) {
          classes += ` ${this.orderType}`
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
      if (item.orderable !== false && item.type !== 'custom') {
        if (item.field === this.orderBy) {
          result[item.field] = 'ordering'
        }
      }
    }

    return result
  }

  clearFilter(): void {
    this.where = {}
  }

  order(field: string) {
    const column = this.columns.find((c) => c.field === field)

    if (column.orderable !== false && column.type !== 'custom') {
      if (this.orderBy === field) {
        this.orderType = this.orderType === 'desc' ? 'asc' : 'desc'
      } else {
        this.orderBy = field
        this.orderType = 'desc'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/scss/index'
</style>
