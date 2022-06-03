<template lang="pug">
component(
  :is="generateFieldByType(column.filter_type)"
  :column="column",
)
</template>
<script setup lang="ts">
import Basic from './filters/Basic.vue'
import Dropdown from './filters/Dropdown.vue'
import Checkbox from './filters/Checkbox.vue'
import Radio from './filters/Radio.vue'

interface Props {
  column: Record<string, any>,
}

const props = defineProps<Props>();
const generateFieldByType = (ftype: string) => {
  let filterLayout = Basic

  switch (ftype) {
  case 'dropdown':
    filterLayout = Dropdown
    break
  case 'checkbox':
    filterLayout = Checkbox
    break
  case 'radio':
    filterLayout = Radio
    break
  default:
    filterLayout = Basic
    break
  }

  if (filterLayout) {
    return filterLayout;
  }

  throw new Error(`Filter type: type "${ftype}" is not found`)
}
</script>
