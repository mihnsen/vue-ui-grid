<template lang="pug">
extends Basic.pug
</template>

<script lang="ts">
import { mixins } from 'vue-class-component'
import { Component, Prop } from 'vue-property-decorator'
import DataMixin from '../../mixins/DataMixin'

@Component
export default class Basic extends mixins(DataMixin) {
  @Prop({
    type: Object,
    required: true
  })

  data: any
  @Prop({
    type: Object,
    required: true
  })
  column: any

  @Prop({
    type: Boolean,
    default: false
  })
  resize!: boolean

  get text() {
    if (this.column.format) {
      if (typeof this.column.format === 'function') {
        return this.column.format(this.data)
      } else {
        return this.column.format.replace(/\{(\w*)\}/g, (matched: string, field: string) => {
          return this.getData(field, this.data)
        })
      }
    }

    return this.getData(this.column.field, this.data)
  }

  get classes() {
    const type = this.column.type || 'text'
    const { field } = this.column

    const classes = [
      `column-type-${type}`,
      `column-data-${field}`
    ]

    if (this.resize && this.column.width) {
      classes.push(`vgrid-field-${this.column.width}`)
    }

    if (this.column.class) {
      classes.push(this.column.class)
    }

    return classes
  }
}
</script>
