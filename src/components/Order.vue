<template lang="pug">
.vgrid-order
  .vgrid-select
    select.vgrid-input(v-model="localValue.by")
      option(
        v-for="col in orderableColumn",
        :value="col.field"
      ) {{ col.label }}
    label
      span Sort:
      strong {{ orderedColumn.label }}
  button.vgrid-order-type(
    v-if="hasSortType",
    @click="toggleType"
  ) {{ localValue.type }}
</template>

<script lang="ts">
import { Component, PropSync, Prop, Vue } from 'vue-property-decorator'
import Order from '../interfaces/order'

@Component({
  name: 'GridOrder',
  model: {
    prop: 'value',
    event: 'update:value'
  }
})
export default class GridOrder extends Vue {
  @PropSync('value', { type: Object, default: () => ({}) })
  localValue!: Order

  @Prop({ type: Array, default: () => ([]) })
  columns!: Array<any>

  @Prop({ type: Boolean, default: true })
  hasSortType!: boolean

  get orderedColumn() {
    return this.columns.find((c) => c.field === this.localValue.by) || {}
  }

  get orderableColumn() {
    return this.columns.filter((c) => c.order)
  }

  toggleType() {
    this.localValue = {
      ...this.localValue,
      type: this.localValue.type === 'desc' ? 'asc' : 'desc'
    }
  }
}
</script>
