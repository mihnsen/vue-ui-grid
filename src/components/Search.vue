<template lang="pug">
form.vgrid-search(@submit.prevent="stop")
  TextInput(
    :placeholder="placeholder",
    v-model="localValue",
  )
</template>
<script lang="ts">
import { Component, Prop, PropSync, Vue } from 'vue-property-decorator'
import TextInput from './TextInput.vue'

@Component({
  model: {
    prop: 'value',
    event: 'update:value'
  },
  components: {
    TextInput
  }
})
export default class ColumnsVisibility extends Vue {
  @PropSync('value', { type: String, default: '' })
  localValue!: string

  @Prop({ default: 'Search..' })
  placeholder!: string

  stop() {}
}
</script>
