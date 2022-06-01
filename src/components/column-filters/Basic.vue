<template lang="pug">
extends Basic.pug
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
const localValue = useLocalValue(props, emits)
const { classes } = useColumnFilter(props)
</script>
