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
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Grid from './BasicGrid.vue'
import { GraphDataProvider } from '../../data-providers'

@Component
export default class GraphGrid extends Grid {
  @Prop({ required: true })
  resource!: string

  @Prop({ required: true })
  resourceMeta!: string

  @Prop()
  searchField!: string

  @Prop({ default: '' })
  refFilter!: string

  dataType: string = 'graphql'
  offsetKey: string = this.$vgrid.offsetKey
  limitKey: string = this.$vgrid.limitKey
  filterKey: string = this.$vgrid.filterKey
  aggregateQuery: string = this.$vgrid.aggregateQuery
  graphqlFilter: Function = this.$vgrid.graphqlFilter
  graphqlOrder: Function = this.$vgrid.graphqlOrder
  graphqlDataCounter: Function = this.$vgrid.graphqlDataCounter

  @Watch('refFilter')
  onRefFilterChanged() {
    this.initProvider()
    this.getData()
  }

  initProvider() {
    this.dataProvider = new GraphDataProvider(this.$apollo, this.resource, this.gridOption)
  }

  get extraGridOption() {
    return {
      searchField: this.searchField,
      resourceMeta: this.resourceMeta,
      refFilter: this.refFilter,
      offsetKey: this.offsetKey,
      limitKey: this.limitKey,
      filterKey: this.filterKey,
      aggregateQuery: this.aggregateQuery,
      graphqlFilter: this.graphqlFilter,
      graphqlOrder: this.graphqlOrder,
      graphqlDataCounter: this.graphqlDataCounter
    }
  }
}
</script>
