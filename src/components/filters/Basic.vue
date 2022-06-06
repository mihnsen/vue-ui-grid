<template lang="pug">
extends Basic.pug
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocalValue } from '@/utilities/hooks'
import TextInput from '../TextInput.vue'
import useFilter from './useFilter'

interface Props {
  modelValue?: string;
  column: Record<string, any>,
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const localValue = useLocalValue(props, emits);
const input = ref();
const {
  isEditor,
  stopClick,
  classes,
  placeholder,
  showEditor,
  onEnter,
} = useFilter(props, localValue, input);

const valueInString = computed(() => localValue.value || 'Any')
</script>
