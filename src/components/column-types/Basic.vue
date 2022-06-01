<template lang="pug">
extends Basic.pug
</template>
<script setup lang="ts">
import { computed } from 'vue'
import useColumnType from './useColumnType'

interface Props {
  column: Record<string, any>;
  data: any;
  resize?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  resize: false,
})
const { text, classes } = useColumnType(props)
</script>
