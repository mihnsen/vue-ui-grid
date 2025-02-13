<template lang="pug">
.vgrid-order
  .vgrid-select
    select.vgrid-input(v-model="orderBy")
      option(
        v-for="col in orderableColumn",
        :value="col.field",
      ) {{ col.label }}
    label
      span.vgrid-label--prefix Sort:
      strong {{ orderedColumn.label }}
  button.vgrid-order-type(
    v-if="hasSortType",
    @click.stop="toggleType"
  ) {{ order.type }}
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type Order from '../interfaces/order'

interface Props {
  modelValue?: any;
  columns?: any[];
  hasSortType?: boolean;
}

interface Emits {
  (event: 'update:modelValue', value: Order): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    by: '',
    type: 'desc',
  }),
  columns: () => ([]),
  hasSortType: true,
});
const emits = defineEmits<Emits>();
const order = computed({
  get: () => ({
    by: props.modelValue ? props.modelValue.by : '',
    type: props.modelValue ? props.modelValue.type : 'desc',
  }),
  set: (newVal) => {
    emits('update:modelValue', newVal);
  },
});

const orderBy = computed({
  get: () => {
    return order.value.by;
  },
  set: (newVal) => {
    order.value = {
      ...order.value,
      by: newVal,
    };
  },
});

const orderedColumn = computed(() => {
  if (!props.columns) {
    return null;
  }

  return props.columns.find((c: any) => c.field === order.value.by) || {}
})
const orderableColumn = computed(() => props.columns.filter((c) => c.order))
const toggleType = () => {
  order.value = {
    ...order.value,
    type: order.value.type === 'desc' ? 'asc' : 'desc',
  };
}
</script>
