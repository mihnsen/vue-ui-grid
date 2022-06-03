<template lang="pug">
form.vgrid-search(@submit.prevent="stop")
  TextInput(
    :placeholder="placeholder",
    v-model="localValue",
  )
</template>
<script setup lang="ts">
import { useLocalValue } from '@/utilities/hooks'
import TextInput from './TextInput.vue'

interface Props {
  modelValue?: string;
  placeholder?: string;
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search',
});
const emits = defineEmits<Emits>();
const localValue = useLocalValue(props, emits);
const stop = () => ({})
</script>
