<template lang="pug">
extends BasicGrid.pug
block body
  include partials/cards.pug
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import GraphGrid from './GraphGrid.vue'

@Component({
  name: 'VGraphCards'
})
export default class VGraphCards extends GraphGrid {
  displayType: string = 'cards'
}
</script>
