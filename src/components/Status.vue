<template lang="pug">
.vgrid-status {{ paginationInfo }}
</template>
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  limit?: number;
  currentPage?: number;
  total?: number;
  showed?: number;
}

const props = withDefaults(defineProps<Props>(), { });
const paginationInfo = computed(() => {
  const from = props.limit * props.currentPage
  const to = from + props.showed
  return `Showing ${from + 1} to ${to} of ${props.total} entries`
})
</script>
