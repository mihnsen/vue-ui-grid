<template lang="pug">
extends Basic.pug
block input
  .custom-control.custom-radio(
    v-for="value in column.filter_value",
  )
    input.custom-control-input(
      v-model="localValue",
      :value="value.id + ''",
      :id="column.field + '-' + value.id",
      type="radio",
    )
    label.custom-control-label(:for="column.field + '-' + value.id")
      | {{ value.label }}
  .text-center.mt-2
    button.btn.btn-sm(
      type="button",
      @click="clearFilter",
    ) Clear
</template>
<script lang="ts">
import { Component, PropSync } from 'vue-property-decorator'
import BasicFilter from './Basic.vue'

@Component({})
export default class RadioFilter extends BasicFilter {
  get valueInString() {
    if (this.localValue) {
      const v = this.column.filter_value
        .find((f: any) => f.id == this.localValue) // eslint-disable-line

      return v ? v.label : this.localValue
    }

    return `${this.column.label}: Any`
  }

  clearFilter() {
    this.localValue = ''
  }
}
</script>
