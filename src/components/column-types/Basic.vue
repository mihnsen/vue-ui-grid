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

  get text() {
    return this.data[this.column.field]
  }

  get classes() {
    const type = this.column.type || 'text'
    const { field } = this.column

    return [`column-type-${type}`, `column-data-${field}`]
  }
}
</script>
