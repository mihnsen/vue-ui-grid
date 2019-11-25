<template lang="pug">
extends BasicGrid.pug
block body
  include partials/cards.pug
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import AjaxGrid from './AjaxGrid.vue'

@Component({
  name: 'VAjaxCards'
})
export default class VAjaxCards extends AjaxGrid {
  displayType: string = 'cards'
}
</script>
