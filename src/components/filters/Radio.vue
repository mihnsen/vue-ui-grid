<template lang="pug">
extends Basic.pug
block input
  .form-check(
    v-for="value in column.filter_value",
  )
    input.form-check-input(
      :name="elName",
      v-model="localValue",
      :value="value.id + ''",
      :id="column.field + '-' + value.id",
      type="radio",
    )
    label.form-check-label(:for="column.field + '-' + value.id")
      | {{ value.label }}
  .text-center.mt-2
    button.btn.btn-sm(
      type="button",
      @click="clearFilter",
    ) Clear
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocalValue } from '../../utilities/hooks'
import { uniqueId } from '../../use/UniqueId'
import useFilter from './useFilter'

interface Props {
  modelValue?: string;
  column: Record<string, any>,
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const localValue = useLocalValue(props, emits)
const input = ref(null)
const elName = computed(() => uniqueId('vgrid-radio-'))
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

  return 'Any'
})

const clearFilter = () => {
  localValue.value = ''
}
</script>
