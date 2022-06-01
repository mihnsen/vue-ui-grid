<template lang="pug">
.vgrid-size
  span Show
  select(
    v-model="localValue",
  )
    option(v-for="(s, index) in sizes", :value="s", :key="index") {{ s }}
  span entries
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocalValue } from '@/utilities/hooks'

interface Props {
  modelValue?: number;
  sizes?: number[];
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: [5, 10, 20, 50, 100],
});
const emits = defineEmits<Emits>();
const localValue = useLocalValue(props, emits);
</script>
