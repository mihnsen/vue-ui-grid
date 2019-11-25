<template lang="pug">
.vgrid
  .vgrid-header
    slot(name="header-start")
    GridFilter(
      v-if="filterable && hasColumnFilter",
      v-model="where",
      :columns="columns"
    )
    GridSearch(
      v-model="searchKeyword",
      :placeholder="searchPlaceholder",
      v-if="searchable"
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
    ExportButton.vgrid-ml-auto(
      v-if="exportable"
      :columns="visibleCols",
      :data="dataCollections",
      :file-name="exportFileName"
    )
    slot(name="header-end")
  .vgrid-body.vgrid-responsive
    .vgrid-loader(v-if="isLoading")
      span IS LOADING
    table.vgrid-table(v-else)
      thead
        tr
          th.vgrid-field-header(
            v-for="col in visibleCols",
            @click="setOrder(col.field)",
            :class="headerColumnClasses(col)"
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
          v-if="!total",
        )
          td(
            :colspan="visibleCols.length"
          )
            span(v-if="!isFiltered") {{ strEmptyData }}
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
      :total="total"
    )
    Pagination(
      v-if="pagination",
      v-model="currentPage",
      :limit="limit",
      :total="total",
    )
</template>
<script lang="ts">
import gql from 'graphql-tag'
import { Component, Vue, Prop } from 'vue-property-decorator'
import Grid from './Grid.vue'

@Component
export default class GraphGrid extends Grid {
  @Prop({ required: true })
  resource!: string

  @Prop({ required: true })
  resourceMeta!: string

  @Prop({ required: true })
  resourceMetaQuery!: string

  offsetKey: string = this.$graphGrid.offsetKey
  limitKey: string = this.$graphGrid.limitKey
  filterKey: string = this.$graphGrid.filterKey
  graphqlFilter: Function = this.$graphGrid.graphqlFilter
  graphqlOrder: Function = this.$graphGrid.graphqlOrder
  graphqlDataCounter: Function = this.$graphGrid.graphqlDataCounter

  // Customize data
  get filteredData() {
    return this.dataCollections
  }

  get showedData() {
    return this.dataCollections
  }

  // Computed properties
  get variables() {
    return {
      offset: this.limit * this.currentPage,
      limit: this.limit
    }
  }

  get graphqColumn() {
    const cols = this.columns.filter(
      col => !['custom', 'query'].includes(col.type)
    )
    const queryCols = this.columns.filter(col => (col.type === 'query'))

    const normalCol = cols
      .filter(col => !col.field.match(/\./))
      .map(col => col.field).join('\n')

    const childCol = cols
      .filter(col => col.field.match(/\./))

    const ref: any = {}
    childCol.forEach((col) => {
      const [refTable, refCol] = col.field.split('.')
      if (ref[refTable]) {
        if (col.id) {
          ref[refTable].push(col.id)
        }

        ref[refTable].push(refCol)
      } else {
        ref[refTable] = col.id ? [col.id, refCol] : [refCol]
      }
    })

    let s = normalCol
    Object.keys(ref).forEach((key) => {
      const refQuery = `
        ${key} {
          ${ref[key].join('\n')}
        }
      `
      s = `${s} ${refQuery}`
    })

    queryCols.forEach((col) => {
      s = `${s} ${col.query}`
    })

    return s
  }

  get searchQuery() {
    let search: Array<string> = []
    if (this.where) {
      const where = { ...this.where }

      search = Object.keys(where).map((key) => {
        const filter = this.getFilter(key, where[key])
        return where[key]
          ? `${filter}`
          : ''
      }).filter(s => s)

      const normalSearch = Object.keys(where)
        .filter(key => !key.match(/\./))
        .map((key) => {
          const filter = this.getFilter(key, where[key])
          return where[key]
            ? `${filter}`
            : ''
        })
        .filter(s => s)

      search = normalSearch
    }

    return search.join('\n')
  }

  get orderQuery() {
    if (this.graphqlOrder && this.order.by) {
      return this.graphqlOrder(this.order.by, this.order.type)
    }

    return ''
  }

  get query() {
    const query = `
      query getData($offset: Int!, $limit: Int!) {
        ${this.resourceMeta} (
          ${this.filterKey}: {
            ${this.searchQuery}
          }
        ) {
          ${this.resourceMetaQuery}
        }
        ${this.resource} (
          ${this.offsetKey}: $offset,
          ${this.limitKey}: $limit,
          ${this.filterKey}: {
            ${this.searchQuery}
          }
          ${this.orderQuery}
        ) {
          ${this.graphqColumn}
        }
      }
    `

    console.log(query)
    return query
  }

  get graphqlQuery() {
    return gql`${this.query}`
  }

  get smartQuery() {
    const _self = this
    return {
      query() {
        return _self.graphqlQuery
      },
      variables() {
        return this.variables
      },
      watchLoading(isLoading: boolean) {
        if (isLoading) {
          _self.isLoading = true
        } else {
          setTimeout(() => {
            _self.isLoading = false
          }, 200)
        }
      },
      result(result: any) {
        const data: any = result.data
        if (data[_self.resource]) {
          _self.$nextTick(() => {
            _self.dataCollections = data[_self.resource]
            _self.total = _self.graphqlDataCounter(data[_self.resourceMeta])
          })
        }
      }
    }
  }

  // Vue component methods
  created() {
    this.initQuery()
  }

  // Methods
  initQuery(): void {
    this.$apollo.addSmartQuery(this.resource, this.smartQuery)
  }

  getFilter(refKey: string, receivedValue: string): string {
    const value = receivedValue.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    const column = this.columns.find(c => c.field === refKey)
    if (this.graphqlFilter) {
      return this.graphqlFilter(column, value)
    }

    return ''
  }
}
</script>
