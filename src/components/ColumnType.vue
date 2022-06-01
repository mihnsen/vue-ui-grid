<template lang="pug">
component(
  :is="generateFieldByType(column.type)"
  :column="column",
  :data="data",
  :resize="resize",
)
  slot
</template>
<script setup lang="ts">
import Basic from './column-types/Basic.vue'
import DateTime from './column-types/DateTime.vue'
import Timestamp from './column-types/Timestamp.vue'
import Custom from './column-types/Custom.vue'

interface Props {
  column: Record<string, any>,
  data: any;
  resize?: boolean;
}

const props = defineProps<Props>()
const generateFieldByType = (ctype: string) => {
  let columnLayout = Basic

  switch (ctype) {
    case 'datetime':
      columnLayout = DateTime
      break
    case 'timestamp':
      columnLayout = Timestamp
      break
    case 'custom':
      columnLayout = Custom
      break
    default:
      break
  }

  if (columnLayout) {
    return columnLayout
  }

  throw new Error(`Column type: type "${ftype}" is not found`)
}
</script>
