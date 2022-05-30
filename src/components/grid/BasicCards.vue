<template lang="pug">
extends BasicGrid.pug
block body
  include partials/cards.pug
</template>
<script lang="ts">
import Grid from './BasicGrid.vue'
import { ref } from 'vue'

export default {
  extends: Grid,
  name: 'VCards',
  setup(props, context) {
    const displayType = ref('cards')
    // TODO: Please remove unused return variable
    return { displayType }
  },
}
</script>
