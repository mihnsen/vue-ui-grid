<template lang="pug">
extends BasicGrid.pug
block body
  include partials/list.pug
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import AjaxGrid from './AjaxGrid.vue'

@Component({
  name: 'VAjaxList'
})
export default class VAjaxList extends AjaxGrid {
  displayType: string = 'list'
}
</script>
