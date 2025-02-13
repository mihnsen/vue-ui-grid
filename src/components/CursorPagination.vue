<template lang="pug">
nav.vgrid-pagination.vgrid-pagination--cursor(v-if="meta")
  ul
    li(
      v-for="(item, index) in pages",
      :class="{ disabled: item.disable }",
      :key="index"
    )
      a(
        href="javascript:;",
        @click="onPageChange(item.page)",
        v-html="item.label"
        :title="item.title",
      )
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocalValue } from '@/utilities/hooks';
import type Page from '../interfaces/page'

interface Props {
  modelValue?: any;
  meta?: any
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  meta: {},
});
const emits = defineEmits<Emits>();
const localValue = useLocalValue(props, emits);

const pages = computed(() => ([
  {
    label: '&lsaquo;',
    page: props.meta?.prev_cursor,
    disable: !props.meta?.prev_cursor,
    title: 'Previous'
  },
  {
    label: '&rsaquo;',
    page: props.meta?.next_cursor,
    disable: !props.meta?.next_cursor,
    title: 'Next'
  }
]))

// Methods
const onPageChange = (page: number) => {
  localValue.value = page
}
</script>
