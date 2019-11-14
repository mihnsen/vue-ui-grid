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
    return this.data[this.column.field]
  }

  get classes() {
    const type = this.column.type || 'text'
    const { field } = this.column

    const classes = [
      `column-type-${type}`,
      `column-data-${field}`
    ]

    if (this.resize && this.column.width) {
      classes.push(`vgrid-col-${this.column.width}`)
    }

    return classes
  }
}
</script>
