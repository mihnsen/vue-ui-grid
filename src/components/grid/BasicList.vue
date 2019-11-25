<template lang="pug">
extends BasicGrid.pug
block body
  include partials/list.pug
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import Grid from './BasicGrid.vue'

@Component({
  name: 'VList'
})
export default class VList extends Grid {
  displayType: string = 'list'
}
</script>
