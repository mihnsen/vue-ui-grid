<template lang="pug">
.vgrid-filter
  FilterItem(
    v-for="col in columns",
    :column="col",
    :key="col.id",
    v-model="localValue[col.field]",
    :show-label="true",
  )
</template>
<script lang="ts">
import { Component, Prop, PropSync, Vue } from 'vue-property-decorator'
import FilterItem from './FilterItem.vue'

@Component({
  name: 'GridFilter',
  model: {
    prop: 'value',
    event: 'update:value'
  },
  components: {
    FilterItem
  }
})
export default class Filter extends Vue {
  @PropSync('value', { type: Object, default: () => ({}) })
  localValue!: object

  @Prop({ type: Array, default: () => ([]) })
  columns!: Array<any>
}
</script>
