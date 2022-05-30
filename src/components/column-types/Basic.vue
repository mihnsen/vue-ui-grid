<template lang="pug">
extends Basic.pug
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { getData } from '../../use/GetData'

interface Props {
  column: Record<string, any>;
  data: any;
  resize?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  resize: false,
});

const text = computed(() => {
  if (props.column.format) {
    if (typeof props.column.format === 'function') {
      return props.column.format(props.data)
    } else {
      return props.column.format.replace(/\{(\w*)\}/g, (matched: string, field: string) => {
        return getData(field, props.data)
      })
    }
  }

  return getData(props.column.field, props.data)
})

const classes = computed(() => {
  const type = props.column.type || 'text'
  const { field } = props.column

  const classes = [
    `column-type-${type}`,
    `column-data-${field}`
  ]

  if (props.resize && props.column.width) {
    classes.push(`vgrid-field-${props.column.width}`)
  }

  if (props.column.class) {
    classes.push(props.column.class)
  }

  return classes
})
</script>
