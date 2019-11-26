<template lang="pug">
extends BasicGrid.pug
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Grid from './BasicGrid.vue'

@Component({
  name: 'VAjaxGrid'
})
export default class AjaxGrid extends Grid {
  @Prop({ required: true })
  resource!: string

  @Prop()
  searchField!: string

  dataType: string = 'ajax'
  hasOrderType = false
  pageKey: string = this.$ajaxGrid.pageKey
  perPageKey: string = this.$ajaxGrid.perPageKey
  sortKey: string = this.$ajaxGrid.sortKey
  sortTypeKey: string = this.$ajaxGrid.sortTypeKey
  getPageIndex: Function = this.$ajaxGrid.getPageIndex
  extractData: Function = this.$ajaxGrid.extractData
  fetchData: Function = this.$ajaxGrid.fetchData

  // Customize data
  get filteredData() {
    return this.dataCollections
  }

  get showedData() {
    return this.dataCollections
  }

  created() {
    this.getAjaxData()
  }

  @Watch('limit') // Items per page
  onChangeLimit() {
    this.currentPage = 0
    this.getAjaxData()
  }

  @Watch('searchKeyword')
  @Watch('currentPage')
  @Watch('order', { immediate: true, deep: true })
  getAjaxData() {
    let currPage = this.currentPage

    if (this.getPageIndex) {
      currPage = this.getPageIndex(this.currentPage)
    }

    const params: any = {
      [this.pageKey]: currPage,
      [this.perPageKey]: this.limit
    }

    if (this.orderable && this.order) {
      if (this.sortKey && this.order.by) {
        params[this.sortKey] = this.order.by
      }

      if (this.sortTypeKey && this.order.type) {
        params[this.sortTypeKey] = this.order.type
      }
    }

    if (this.searchable && this.searchField && this.searchKeyword) {
      params[this.searchField] = this.searchKeyword
    }

    this.isLoading = true

    return this.fetchData(this.resource, {
      params
    })
      .then((data: any) => {
        const extractedData = this.extractData(data)

        if (extractedData) {
          this.dataCollections = extractedData.items
          this.total = extractedData.total
        }
      })
      .then(() => {
        setTimeout(() => {
          this.isLoading = false
        }, 350)
      })
  }
}
</script>
