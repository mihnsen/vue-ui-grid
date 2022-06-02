<template lang="pug">
nav.vgrid-pagination(v-if="totalPage > 1")
  ul
    li(
      v-for="(item, index) in pages",
      :class="{ active: item.page === localValue, disabled: item.disable }",
      :key="index"
    )
      a(
        href="javascript:;",
        @click="onPageChange(item.page)",
        v-html="item.label"
      )
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocalValue } from '@/utilities/hooks';
import { type Page } from '../interfaces/page'

interface Props {
  modelValue?: number;
  limit?: number;
  total?: number
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10,
  total: 0,
});
const emits = defineEmits<Emits>();
const localValue = useLocalValue(props, emits);

const totalPage = computed(() => {
  if (!(props.total % props.limit)) {
    return props.total / props.limit
  }

  return Math.floor(props.total / props.limit) + 1
})

// FIXME
// Copied from @cedrus axisflow
// Should be revised
const pages = computed(() => {
  const step = [-2, -1, 0, 1, 2].map((i) => i + localValue.value)
  // prev button.
  const result: Page[] = [
    {
      label: '&laquo;',
      page: localValue.value - 1,
      disable: localValue.value === 0
    }
  ]

  // 5 pages in the middle.
  // eslint-disable-next-line no-restricted-syntax
  for (const i of step) {
    if (i >= 0 && i < totalPage.value) {
      if (i === 0) {
        result.push({
          label: '1',
          page: 0
        })
      } else if (i === localValue.value) {
        result.push({
          label: i + 1,
          page: i
        })
      } else {
        result.push({
          label: i + 1,
          page: i
        })
      }
    }
  }

  // next button.
  result.push({
    label: '&raquo;',
    page: localValue.value + 1,
    disable: localValue.value === totalPage.value - 1
  })

  if (totalPage.value > 5) {
    // first button.
    if (localValue.value > 2) {
      result.splice(1, 0, {
        label: '1..',
        page: 0
      })
    }

    // last button.
    if (localValue.value < totalPage.value - 3) {
      result.splice(result.length - 1, 0, {
        label: `..${totalPage.value}`,
        page: totalPage.value - 1
      })
    }
  }

  return result
})

// Methods
const onPageChange = (page: number) => {
  localValue.value = page
}
</script>
