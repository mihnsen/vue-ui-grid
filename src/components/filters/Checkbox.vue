<template lang="pug">
extends Basic.pug
block input
  .custom-control.custom-checkbox(
    v-for="value in column.filter_value",
  )
    input.custom-control-input(
      v-model="checkboxValues",
      :value="value.id + ''",
      :id="column.field + '-' + value.id",
      type="checkbox",
    )
    label.custom-control-label(:for="column.field + '-' + value.id")
      | {{ value.label }}
</template>
<script lang="ts">
import { Component, PropSync } from 'vue-property-decorator'
import BasicFilter from './Basic.vue'

@Component({})
export default class CheckboxFilter extends BasicFilter {
  get checkboxValues() {
    return this.getInitialData()
  }

  set checkboxValues(newVal) {
    this.$emit('input', newVal)
  }

  get valueInString() {
    if (this.checkboxValues && this.checkboxValues.length) {
      const data = this.column.filter_value
        .filter((f: any) => this.checkboxValues.indexOf(f.id.toString()) !== -1)
        .map((f: any) => f.label)
        .join(', ')

      return data
    }

    return `${this.column.label}: Any`
  }

  getInitialData() : any {
    if (typeof this.localValue === 'string') {
      return [this.localValue]
    } else if (typeof this.localValue === 'object') {
      return this.localValue
    }

    return []
  }
}
/* eslint-enable */
</script>
