<template lang="pug">
.vgrid-text-input
  input.vgrid-input(
    ref="input",
    type="text",
    :placeholder="placeholder",
    v-model="localValue",
    v-on:keyup.enter="onEnter"
  )
  a.vgrid-input-clear(
    v-if="localValue",
    href="javascript:;",
    @click="clearFilter"
  ) &times;
</template>
<script lang="ts">
import { Component, PropSync, Prop, Emit, Vue } from 'vue-property-decorator'

@Component({
  model: {
    prop: 'value',
    event: 'update:value'
  }
})
export default class TextInput extends Vue {
  @PropSync('value', { type: String, default: '' })
  localValue!: string

  @Prop()
  placeholder!: string

  @Prop({ default: true })
  clearable!: boolean

  clearFilter() {
    this.localValue = ''
  }

  stop() {}

  focus() {
    this.$nextTick(() => {
      const input = this.$refs.input as HTMLInputElement
      input.focus()
    })
  }

  @Emit('enter')
  onEnter() {}
}
</script>
