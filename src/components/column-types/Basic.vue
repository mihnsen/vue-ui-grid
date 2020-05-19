<template lang="pug">
extends Basic.pug
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Basic extends Vue {
  @Prop({
    type: Object,
    required: true
  })
  column: any

  @Prop({
    type: Object,
    required: true
  })
  data: any

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
          return this.getData(field)
        })
      }
    }

    return this.getData(this.column.field)
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

  getData(field: string) {
    const fields = field.split('.')
    const res = fields.reduce((acc: any, curr: string, index) => {
      return acc[curr] || (index < fields.length - 1 ? {} : null)
    }, this.data)

    return res ? res : '' // eslint-disable-line
  }
}
</script>
