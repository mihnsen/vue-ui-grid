<template lang="pug">
extends Basic.pug
block content
  span {{ date }}
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import { DateTime } from 'luxon'
import Basic from './Basic.vue'

@Component
export default class DateTimeType extends Basic {
  get date(): string {
    if (this.text) {
      return DateTime.local(this.text).toLocaleString(DateTime.DATETIME_MED)
    }

    return ''
  }
}
</script>
