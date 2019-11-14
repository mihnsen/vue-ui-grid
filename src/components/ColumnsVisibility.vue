<template lang="pug">
.vgrid-visibility(@click.stop="stopClick")
  button.vgrid-visibility-button(
    type="button",
    @click="toggleVisibility"
  )
    span
      | Columns visibility
      span
  .vgrid-visibility-body(v-show="showVisibility")
    .vgrid-visibility-column(
      v-for="(item, index) in columnData",
      :key="item.id",
      v-show="item.type !== 'hidden'",
    )
      input(
        type="checkbox",
        :id="'grid-column-' + item.field",
        v-model="tempValue",
        :value="item.field",
        :disabled="item.type === 'custom'"
      )
      label(
        :for="'grid-column-' + item.field"
      ) {{ (item.label || item.field) | vgrid_header }}

      button.vgrid-visibility-down(
        @click="moveDown(index)"
      ) &nbsp;
      button.vgrid-visibility-up(
        @click="moveUp(index)"
      ) &nbsp;
</template>
<script lang="ts">
import { Component, Prop, PropSync, Watch, Vue } from 'vue-property-decorator'
import Field from '../interfaces/field'

@Component({
  model: {
    prop: 'value',
    event: 'update:value'
  },
  filters: {
    vgrid_header(str: string) {
      if (str) {
        const s = str.charAt(0).toUpperCase() + str.slice(1)
        return s.replace(/_/, ' ')
      }

      return str
    }
  }
})
export default class ColumnsVisibility extends Vue {
  @PropSync('value', { type: Array, default: () => ([]) })
  localValue!: Array<string>

  @Prop({ type: Array, default: () => ([]) })
  columns!: Array<Field>

  showVisibility: boolean = false

  tempValue: Array<string> = []
  columnData: Array<Field> = []

  @Watch('tempValue')
  onTempValueChange() {
    this.updateValue()
  }

  mounted(): void {
    document.body.addEventListener('click', this.handleBodyClick)
    this.initialize()
  }

  beforeDestroy(): void {
    document.body.removeEventListener('click', () => {}, false)
  }

  handleBodyClick() {
    this.showVisibility = false
  }

  toggleVisibility() {
    this.showVisibility = !this.showVisibility
  }

  updateValue() {
    this.localValue = this.calculateValue()
  }

  stopClick() {}

  initialize() {
    this.columnData = [...this.columns]
    this.tempValue = this.localValue
  }

  moveUp(index: number) {
    if (index < this.columns.length - 1) {
      const from = index
      const to = index + 1
      this.columnData.splice(to, 0, this.columnData.splice(from, 1)[0])
      this.updateValue()
    }
  }

  moveDown(index: number) {
    if (index > 0) {
      const from = index
      const to = index - 1
      this.columnData.splice(to, 0, this.columnData.splice(from, 1)[0])
      this.updateValue()
    }
  }

  calculateValue() {
    return this.columnData.filter((c) => this.tempValue.includes(c.field))
      .map((c) => c.field)
  }
}
</script>
