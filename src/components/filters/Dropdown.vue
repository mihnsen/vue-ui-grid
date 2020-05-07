<template lang="pug">
extends Basic.pug
block input
  select.vgrid-input(
    ref="input",
    v-model="localValue"
  )
    option(value="") Select a value
    option(
      v-for="value in column.filter_value",
      :value="value.id + ''",
    ) {{ value.label }}
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import BasicFilter from './Basic.vue'

@Component({})
export default class DropdownFilter extends BasicFilter {
  get valueInString() {
    if (this.localValue) {
      const v = this.column.filter_value.find((f: any) => f.id == this.localValue) // eslint-disable-line

      return v ? v.label : this.localValue
    }

    return `${this.column.label}: Any`
  }
}
</script>
