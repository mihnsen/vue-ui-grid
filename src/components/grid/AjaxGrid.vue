<template lang="pug">
extends BasicGrid.pug
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Grid from './BasicGrid.vue'
import { AjaxDataProvider } from '../../data-providers'

@Component({
  name: 'VAjaxGrid'
})
export default class AjaxGrid extends Grid {
  @Prop({ required: true })
  resource!: string

  @Prop()
  searchField!: string

  dataType: string = 'ajax'
  pageKey: string = this.$vgrid.pageKey
  perPageKey: string = this.$vgrid.perPageKey
  sortKey: string = this.$vgrid.sortKey
  sortTypeKey: string = this.$vgrid.sortTypeKey
  getPageIndex: Function = this.$vgrid.getPageIndex
  extractData: Function = this.$vgrid.extractData
  fetchData: Function = this.$vgrid.fetchData
  cancelToken: any = this.$vgrid.cancelToken

  initProvider() {
    this.dataProvider = new AjaxDataProvider(this.resource, this.gridOption)
  }

  get extraGridOption() {
    return {
      searchField: this.searchField,
      pageKey: this.pageKey,
      perPageKey: this.perPageKey,
      sortKey: this.sortKey,
      sortTypeKey: this.sortTypeKey,
      getPageIndex: this.getPageIndex,
      extractData: this.extractData,
      fetchData: this.fetchData,
      cancelToken: this.cancelToken
    }
  }
}
</script>
