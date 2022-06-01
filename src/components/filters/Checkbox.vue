<template lang="pug">
extends Basic.pug
block input
  .form-check(
    v-for="value in column.filter_value",
  )
    input.form-check-input(
      v-model="localValue",
      :value="value.id + ''",
      :id="column.field + '-' + value.id",
      type="checkbox",
    )
    label.form-check-label(:for="column.field + '-' + value.id")
      | {{ value.label }}
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useLocalValue } from '@/utilities/hooks'
import { uniqueId } from '@/use/UniqueId'
import useFilter from './useFilter'

interface Props {
  column: Record<string, any>,
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const localValue = useLocalValue(props, emits, null)
const elName = computed(() => uniqueId('vgrid-checkbox-'))
const {
  isEditor,
  stopClick,
  classes,
  placeholder,
  showEditor,
  onEnter,
} = useFilter(props, localValue);

const valueInString = computed(() => {
  if (localValue.value && localValue.value.length) {
    const data = props.column.filter_value
      .filter((f: any) => localValue.value.indexOf(f.id.toString()) !== -1)
      .map((f: any) => f.label)
      .join(', ')

    return data
  }

  return `${props.column.label}: Any`
})
</script>
