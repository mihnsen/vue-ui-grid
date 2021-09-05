<template lang="pug">
.vgrid-text-input
  input.vgrid-input(
    :class="{ 'vgrid-input--active' : localValue }"
    ref="input",
    type="text",
    :placeholder="placeholder",
    v-model="localValue",
    @input="onChange",
    v-on:keyup.enter="onEnter"
  )
  a.vgrid-input-clear(
    v-if="value",
    href="javascript:;",
    @click="clearFilter"
  ) &times;
</template>
<script lang="ts">
import { Component, PropSync, Watch, Prop, Emit, Vue } from 'vue-property-decorator'

@Component({
  model: {
    prop: 'value',
    event: 'update:value'
  }
})
export default class TextInput extends Vue {
  @Prop({ type: String, default: '' })
  value!: string

  @Prop()
  placeholder!: string

  @Prop({ default: true })
  clearable!: boolean

  localValue: string = this.value

  @Watch('value')
  setValue() {
    this.localValue = this.value
  }

  typing: boolean = false
  timeout: any = false

  clearFilter() {
    this.updateValue('')
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

  onChange(event: Event) {
    this.typing = true
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setTimeout(() => {
      const value = (event.target as HTMLInputElement).value
      this.typing = false
      this.updateValue(value)
      clearTimeout(this.timeout)
    }, 500)
  }

  updateValue(val: string) {
    this.$emit('update:value', val)
  }
}
</script>
