<template lang="pug">
extends Basic.pug
</template>
<script lang="ts">
import { Component, Prop, PropSync, Emit, Vue } from 'vue-property-decorator'

@Component({
  model: {
    prop: 'value',
    event: 'update:value'
  }
})
export default class Basic extends Vue {
  @Prop({
    type: Object,
    required: true
  })
  column: any

  @PropSync('value', { type: String }) localValue: any

  get classes() {
    const type = this.column.type || 'text'
    const { field } = this.column

    return [`column-type-${type}`, `column-data-${field}`]
  }

  @Emit()
  clearFilter() {
    this.localValue = ''
  }
}
</script>
