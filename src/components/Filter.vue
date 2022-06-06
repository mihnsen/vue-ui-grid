<template lang="pug">
.vgrid-filter
  template(
    v-for="col in columns"
    :key="col.id",
  )
    component(
      v-if="col.filter",
      :is="generateFieldByType(col.filter_type)"
      :column="col",
      v-model="localValue[col.field]",
    )
</template>
<script setup lang="ts">
import { useLocalValue } from '@/utilities/hooks'
import Basic from './filters/Basic.vue'
import Dropdown from './filters/Dropdown.vue'
import Checkbox from './filters/Checkbox.vue'
import Radio from './filters/Radio.vue'


interface Props {
  modelValue?: any;
  columns?: any[];
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: {},
  columns: () => ([]),
});
const emits = defineEmits<Emits>();
const localValue = useLocalValue(props, emits);

const generateFieldByType = (ftype: string) => {
  let filterItem = Basic

  switch (ftype) {
    case 'dropdown':
      filterItem = Dropdown
      break
    case 'checkbox':
      filterItem = Checkbox
      break
    case 'radio':
      filterItem = Radio
      break
    default:
      break
  }

  return filterItem;
}
</script>
