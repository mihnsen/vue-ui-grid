<template lang="pug">
.vgrid-export-button
  button(
    @click="exportData"
  ) Export
</template>
<script lang="ts">
import { mixins } from 'vue-class-component'
import { Component, Prop, Vue } from 'vue-property-decorator'
import DataMixin from '../mixins/DataMixin'

@Component({
  name: 'ExportButton'
})
export default class ExportButton extends mixins(DataMixin) {
  @Prop({ type: Array, default: () => ([]) })
  data!: Array<any>

  @Prop({ type: Array, default: () => ([]) })
  columns!: Array<any>

  @Prop({
    type: String,
    default: () => ((new Date()).toISOString())
  })
  fileName!: String

  get filteredColumn() {
    return this.columns.filter(c => c.type !== 'custom')
  }

  exportData() {
    const header = this.filteredColumn.map(c => c.label).join(',')

    const body = this.data.map(d => {
      return this.filteredColumn.map(c => this.getData(c.field, d)) // Get data
        .map(v => `"${v}"`) // Cast string
        .join(',') // Split row
    }).join('\n')

    const csvContent = `data:text/csv;charset=utf-8,${header}\n${body}`

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${this.fileName}.csv`)
    document.body.appendChild(link) // Required for FF

    link.click()
  }
}
</script>
