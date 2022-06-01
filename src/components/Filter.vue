<template lang="pug">
.vgrid-filter
  template(
    v-for="col in columns"
    :key="col.id",
  )
    FilterItem(
      v-if="col.filter",
      :column="col",
      v-model="localValue[col.field]",
    )
</template>
<script setup lang="ts">
import FilterItem from './FilterItem.vue'
import { useLocalValue } from '@/utilities/hooks'

interface Props {
  modelValue?: any;
  columns?: any[];
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: {},
  columns: [],
});
const emits = defineEmits<Emits>();
const localValue = useLocalValue(props, emits);
</script>
