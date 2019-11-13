<template lang="pug">
extends Basic.pug
block content
  span {{ date }}
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import Basic from './Basic.vue'

@Component
export default class DateTimeType extends Basic {
  get date(): string {
    // TODO date + format
    return this.text
  }
}
</script>
