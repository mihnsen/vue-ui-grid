<template lang="pug">
extends Basic.pug
block content
  span {{ timestamp }}
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import Basic from './Basic.vue'

@Component
export default class Timestamp extends Basic {
  get timestamp(): string | number {
    // TODO timestamp
    return this.text
  }
}
</script>
