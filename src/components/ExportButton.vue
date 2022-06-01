<template lang="pug">
.vgrid-export-button
  button(
    @click="exportData"
  ) Export
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { getData } from '../use/GetData'

interface Props {
  data?: any[];
  columns?: any[];
  fileName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: [],
  fileName: (new Date()).toISOString(),
})
const filteredColumn = computed(() => {
  return props.columns.filter(c => c.type !== 'custom')
})

const exportData = () => {
  const header = filteredColumn.value.map(c => c.label).join(',')

  const body = props.data.map(d => {
    return filteredColumn.value.map(c => getData(c.field, d)) // Get data
      .map(v => `"${v}"`) // Cast string
      .join(',') // Split row
  }).join('\n')

  const csvContent = `data:text/csv;charset=utf-8,${header}\n${body}`

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `${props.fileName}.csv`)
  document.body.appendChild(link) // Required for FF

  link.click()
}
</script>
