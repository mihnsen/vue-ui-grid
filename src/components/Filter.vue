<template lang="pug">
.vgrid-filter
  form.d-flex(@submit.prevent="stop")
    label.vgrid-search
      // i.vgrid-search-icon.la.la-search
      input.input-normal(
        type="text",
        placeholder="Search..",
        v-model="localValue",
      )
    button.btn.btn-outline-primary.ml-2(
      type="submit",
    ) Search
</template>
<script lang="ts">
import { Component, PropSync, Vue } from 'vue-property-decorator'

@Component({
  model: {
    prop: 'value',
    event: 'update:value'
  }
})
export default class ColumnsVisibility extends Vue {
  @PropSync('value', { type: String, default: '' })
  localValue!: string

  stop() {}
}
</script>
