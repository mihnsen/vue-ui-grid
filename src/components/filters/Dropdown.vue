<template lang="pug">
extends Basic.pug
block input
  select.vgrid-input(
    ref="input",
    v-model="localValue"
  )
    option(value="") Select a value
    option(
      v-for="value in column.filter_value",
      :value="value.id + ''",
    ) {{ value.label }}
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocalValue } from '@/utilities/hooks'
import useFilter from './useFilter'

interface Props {
  column: Record<string, any>,
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const localValue = useLocalValue(props, emits, null);
const input = ref<HTMLSelectElement>(null);
const {
  isEditor,
  stopClick,
  classes,
  placeholder,
  showEditor,
  onEnter,
} = useFilter(props, localValue, input);

const valueInString = computed(() => {
  if (localValue.value) {
    const v = props.column.filter_value
      .find((f: any) => f.id == localValue.value) // eslint-disable-line

    return v ? v.label : localValue.value
  }

  return `${props.column.label}: Any`
})
</script>
