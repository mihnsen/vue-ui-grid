<template lang="pug">
.vgrid-status {{ paginationInfo }}
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class GridInfo extends Vue {
  @Prop()
  limit!: number

  @Prop()
  currentPage!: number

  @Prop()
  total!: number

  @Prop()
  showed!: number

  get paginationInfo() {
    const from = this.limit * this.currentPage
    const to = from + this.showed
    return `Showing ${from + 1} to ${to} of ${this.total} entries`
  }
}
</script>
