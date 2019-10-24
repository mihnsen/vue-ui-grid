<template lang="pug">
td(
  :class="classes",
)
  slot
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import Basic from './Basic.vue'

@Component
export default class Timestamp extends Basic {}
</script>
