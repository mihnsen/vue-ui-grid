<template lang="pug">
.vgrid-size
  span Show
  select(
    v-model="localValue",
  )
    option(v-for="(s, index) in sizes", :value="s", :key="index") {{ s }}
  span entries
</template>
<script lang="ts">
import { Component, Prop, PropSync, Vue } from 'vue-property-decorator'

@Component({
  model: {
    prop: 'value',
    event: 'update:value'
  }
})
export default class PageSize extends Vue {
  @PropSync('value', { type: Number })
  localValue!: number

  @Prop({
    type: Array,
    default: () => [5, 10, 20, 50, 100]
  })
  sizes!: []
}
</script>
