<template lang="pug">
extends BasicGrid.pug
block body
  include partials/list.pug
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import GraphGrid from './GraphGrid.vue'

@Component({
  name: 'VGraphList'
})
export default class VGraphList extends GraphGrid {
  displayType: string = 'list'
}
</script>
