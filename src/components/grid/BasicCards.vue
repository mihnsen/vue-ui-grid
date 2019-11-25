<template lang="pug">
extends BasicGrid.pug
block body
  include partials/cards.pug
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import Grid from './BasicGrid.vue'

@Component({
  name: 'VCards'
})
export default class VCards extends Grid {
  displayType: string = 'cards'
}
</script>
