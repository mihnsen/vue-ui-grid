<template lang="pug">
.vgrid-order
  .vgrid-select
    select.vgrid-input(v-model="order.by")
      option(
        v-for="col in orderableColumn",
        :value="col.field"
      ) {{ col.label }}
    label
      span Sort:
      strong {{ orderedColumn.label }}
  button.vgrid-order-type(
    v-if="hasSortType",
    @click="toggleType"
  ) {{ order.type }}
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { type Order } from '../interfaces/order'

interface Props {
  modelValue?: Order;
  columns?: any[];
  hasSortType?: boolean;
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: {
    by: '',
    type: 'desc',
  },
  columns: () => ([]),
  hasSortType: true,
});
const emits = defineEmits<Emits>();
let order = reactive<Order>(props.modelValue);
const orderedColumn = computed(() => {
  return props.columns.find((c) => c.field === order.by) || {}
})
const orderableColumn = computed(() => props.columns.filter((c) => c.order))
const toggleType = () => {
  order.type = order.type === 'desc' ? 'asc' : 'desc'
  emits('update:modelValue', order)
}
</script>
