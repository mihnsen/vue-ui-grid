<template lang="pug">
.vgrid-columns.vgrid-visibility(@click.prevent.stop="stopClick")
  button.btn.btn-outline-secondary.btn-sm(
    type="button",
    :class="{ 'text-primary': showVisibility }",
    @click="toggleVisibility"
  )
    i.la.la-eye
    | &nbsp;
    span Columns

  .vgrid-columns-body.shadow(v-show="showVisibility")
    .vgrid-column(
      v-for="(item, index) in localValue",
      :key="item.id",
      :index="index",
      v-show="item.type !== 'hidden'",
    )
      pre {{ localValue[index].hidden }}
      .custom-control.custom-checkbox
        input.custom-control-input(
          v-model="localValue[index].hidden"
          :id="'grid-column-' + item.field"
          type="checkbox",
          :disabled="item.field === 'action'"
        )
        label.custom-control-label(
          :for="'grid-column-' + item.field"
        ) {{ (item.label || item.field) | vgrid_header }}
</template>
<script lang="ts">
import { Component, PropSync, Vue } from 'vue-property-decorator'

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
