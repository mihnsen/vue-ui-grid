<template lang="pug">
.vgrid-text-input
  input.vgrid-input(
    type="text",
    :placeholder="placeholder",
    v-model="localValue",
  )
  a.vgrid-input-clear(
    v-if="localValue",
    href="javascript:;",
    @click="clearFilter"
  ) &times;
</template>
<script lang="ts">
import { Component, PropSync, Prop, Vue } from 'vue-property-decorator'

@Component({
  model: {
    prop: 'value',
    event: 'update:value'
  }
})
export default class ColumnsVisibility extends Vue {
  @PropSync('value', { type: String, default: '' })
  localValue!: string

  @Prop()
  placeholder!: string

  @Prop({ default: true })
  clearable: boolean

  clearFilter() {
    this.localValue = ''
  }

  stop() {}
}
</script>
