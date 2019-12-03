<template lang="pug">
extends BasicGrid.pug
block search
  GridSearch(
    v-model="where[searchField]",
    :placeholder="searchPlaceholder",
    v-if="searchable"
  )
</template>
<script lang="ts">
import gql from 'graphql-tag'
import { Component, Vue, Prop } from 'vue-property-decorator'
import Grid from './BasicGrid.vue'

@Component
export default class GraphGrid extends Grid {
  @Prop({ required: true })
  resource!: string

  @Prop({ required: true })
  resourceMeta!: string

  @Prop()
  searchField!: string

  @Prop({ default: '' })
  extraFilter!: string

  dataType: string = 'graphql'
  offsetKey: string = this.$graphGrid.offsetKey
  limitKey: string = this.$graphGrid.limitKey
  filterKey: string = this.$graphGrid.filterKey
  aggregateQuery: string = this.$graphGrid.aggregateQuery
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
            ${this.extraFilter}
            ${this.searchQuery}
          }
        ) {
          ${this.aggregateQuery}
        }
        ${this.resource} (
          ${this.offsetKey}: $offset,
          ${this.limitKey}: $limit,
          ${this.filterKey}: {
            ${this.extraFilter}
            ${this.searchQuery}
          }
          ${this.orderQuery}
        ) {
          ${this.graphqColumn}
        }
      }
    `

    // console.log(query)
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
      loadingKey: 'loading',
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
        if (data && data[_self.resource]) {
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
