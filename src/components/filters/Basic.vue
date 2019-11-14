<template lang="pug">
extends Basic.pug
</template>
<script lang="ts">
import { Component, Prop, PropSync, Vue } from 'vue-property-decorator'
import TextInput from '../TextInput.vue'

@Component({
  model: {
    prop: 'value',
    event: 'update:value'
  },
  components: {
    TextInput
  }
})
export default class Basic extends Vue {
  @Prop({
    type: Object,
    required: true
  })
  column: any

  @Prop({
    type: Boolean,
    default: false
  })
  showLabel!: boolean

  @PropSync('value', { type: String }) localValue: any

  isEditor: boolean = false

  get valueInString() {
    return this.localValue ? this.localValue : 'Any'
  }

  get classes() {
    const type = this.column.type || 'text'
    const { field } = this.column

    return [`column-type-${type}`, `column-data-${field}`]
  }

  mounted(): void {
    document.body.addEventListener('click', this.handleBodyClick)
    document.addEventListener('vgrid-filter-editor', this.handleBodyClick)
  }

  beforeDestroy(): void {
    document.body.removeEventListener('click', () => {}, false)
    document.removeEventListener('vgrid-filter-editor', this.handleBodyClick)
  }

  handleBodyClick() {
    this.isEditor = false
  }

  showEditor() {
    // Dispatch event to hide other filter editor
    document.dispatchEvent(new Event('vgrid-filter-editor'))

    // Then open current editor
    this.isEditor = true

    const textInput = this.$refs.input as HTMLElement
    if (textInput) {
      textInput.focus()
    }
  }

  stopClick() {}

  onEnter() {
    this.isEditor = false
  }
}
</script>
