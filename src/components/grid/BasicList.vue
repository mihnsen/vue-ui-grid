<template lang="pug">
extends BasicGrid.pug
block body
  include partials/list.pug
</template>
<script lang="ts">
import Grid from './BasicGrid.vue';
import { ref } from 'vue'

export default {
  extends: Grid,
  name: 'VList',
  setup(props, context) {
    const displayType = ref('list')
    // TODO: Please remove unused return variable
    return { displayType }
  },
}
</script>
