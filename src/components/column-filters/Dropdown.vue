<template lang="pug">
extends Basic.pug
block content
  select.vgrid-input(
    ref="input",
    v-model="localValue"
  )
    option(value="") Clear selected
    option(
      v-for="value in column.filter_value",
      :value="value.id + ''",
    ) {{ value.label }}
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useLocalValue } from '@/utilities/hooks'
import useColumnFilter from './useColumnFilter'
import TextInput from '../TextInput.vue'

interface Props {
  modelValue?: string;
  column: Record<string, any>;
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const localValue = useLocalValue(props, emits, null)
const { classes } = useColumnFilter(props)
</script>
