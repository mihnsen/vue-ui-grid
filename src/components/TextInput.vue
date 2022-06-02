<template lang="pug">
.vgrid-text-input
  input.vgrid-input(
    :class="{ 'vgrid-input--active' : localValue }"
    ref="input",
    type="text",
    :placeholder="placeholder",
    @input="onChange",
  )
  a.vgrid-input-clear(
    v-if="hasClearable",
    href="javascript:;",
    @click="clearFilter"
  ) &times;
</template>
<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useLocalValue } from '@/utilities/hooks';

interface Props {
  modelValue?: string;
  placeholder?: string;
  clearable?: boolean;
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  clearable: true,
});
const emits = defineEmits<Emits>();
const localValue = useLocalValue(props, emits);
const input = ref<HTMLInputElement>(null);
const typing = ref(false);
const timeout = ref(null);
const hasClearable = computed(() => props.clearable && props.modelValue);

const clearFilter = () => {
  localValue.value = '';
}

const onChange = (event: Event) => {
  typing.value = true
  if (timeout.value) {
    clearTimeout(timeout.value)
  }

  timeout.value = setTimeout(() => {
    const value = (event.target as HTMLInputElement).value
    localValue.value = value

    typing.value = null
    clearTimeout(timeout.value)
  }, 500)
}

const focus = async () => {
  await nextTick(() => {
    input.value.focus()
  })
}

defineExpose({
  focus,
})
</script>
