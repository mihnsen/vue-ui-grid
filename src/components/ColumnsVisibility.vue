<template lang="pug">
.vgrid-visibility(@click.stop="stopClick")
  button(
    type="button",
    @click="toggleVisibility"
  )
    // i.la.la-eye
    // | &nbsp;
    span Columns visibility
  .vgrid-visibility-body(v-show="showVisibility")
    .vgrid-visibility-column(
      v-for="(item, index) in columns",
      :key="item.id",
      v-show="item.type !== 'hidden'",
    )
      input(
        type="checkbox",
        :id="'grid-column-' + item.field",
        v-model="localValue",
        :value="item.field",
        :disabled="item.field === 'action'"
      )
      label(
        :for="'grid-column-' + item.field"
      ) {{ (item.label || item.field) | vgrid_header }}
</template>
<script lang="ts">
import { Component, Prop, PropSync, Vue } from 'vue-property-decorator'

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
  localValue!: Array<any>

  @Prop({ type: Array, default: () => ([]) })
  columns!: Array<any>

  showVisibility: boolean = false

  mounted(): void {
    document.body.addEventListener('click', this.handleBodyClick)
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

  stopClick() {}
}
</script>
