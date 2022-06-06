<template lang="pug">
component(
  :is="generateFieldByType(column.filter_type)"
  :column="column",
)
</template>
<script setup lang="ts">
import Basic from './column-filters/Basic.vue'
import Dropdown from './column-filters/Dropdown.vue'

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
    default:
      break
  }

  return filterLayout
};
</script>
