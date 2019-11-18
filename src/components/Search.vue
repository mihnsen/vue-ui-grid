<template lang="pug">
form.vgrid-search(@submit.prevent="stop")
  TextInput(
    placeholder="Contain text..",
    v-model="localValue",
  )
</template>
<script lang="ts">
import { Component, PropSync, Vue } from 'vue-property-decorator'
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

  stop() {}
}
</script>
