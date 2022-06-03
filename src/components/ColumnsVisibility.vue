<template lang="pug">
.vgrid-visibility(@click.stop="stopClick")
  button.vgrid-visibility-button(
    type="button",
    @click="toggleVisibility"
  )
    span
      | Columns visibility
      span
  .vgrid-visibility-body(v-show="showVisibility")
    .vgrid-visibility-column(
      v-for="(column, index) in columnData",
      :key="column.id",
      v-show="column.type !== 'hidden'",
    )
      input(
        type="checkbox",
        :id="'grid-column-' + column.field",
        v-model="tempValue",
        :value="column.field",
      )
      label(
        :for="'grid-column-' + column.field"
      ) {{ useGridHeader(column.label || column.field) }}

      button.vgrid-visibility-down(
        @click="moveDown(index)"
      ) &nbsp;
      button.vgrid-visibility-up(
        @click="moveUp(index)"
      ) &nbsp;
</template>
<script setup lang="ts">
import { computed, watch, ref, onMounted, onBeforeUnmount } from 'vue'
import { useLocalValue } from '@/utilities/hooks'
import { useGridHeader } from '@/utilities/filters';
import { type ColumnOption } from '../interfaces/column-option'

interface Props {
  modelValue?: any;
  columns?: any[];
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  columns: () => ([]),
});
const emits = defineEmits<Emits>();
const localValue = useLocalValue(props, emits);
const showVisibility = ref<boolean>(false)

const tempValue = ref<string[]>([])
const columnData = ref<ColumnOption[]>([])

watch(
  () => tempValue.value,
  () => {
    updateValue()
  }
)

const toggleVisibility = () => {
  showVisibility.value = !showVisibility.value
}

const updateValue = () => {
  localValue.value = calculateValue()
}

const stopClick = () => ({})

const initialize = () => {
  columnData.value = [...props.columns]
  tempValue.value = localValue.value
}

const moveUp = (index: number) => {
  if (index < props.columns.length - 1) {
    const from = index
    const to = index + 1
    columnData.value.splice(to, 0, columnData.value.splice(from, 1)[0])
    updateValue()
  }
}

const moveDown = (index: number) => {
  if (index > 0) {
    const from = index
    const to = index - 1
    columnData.value.splice(to, 0, columnData.value.splice(from, 1)[0])
    updateValue()
  }
}

const calculateValue = () => {
  return columnData.value.filter((c) => tempValue.value.includes(c.field))
    .map((c) => c.field)
}

const handleBodyClick = () => {
  showVisibility.value = false
}

onMounted(() => {
  document.body.addEventListener('click', handleBodyClick)
  initialize()
})

onBeforeUnmount(() => {
  document.body.removeEventListener('click', handleBodyClick)
})
</script>
