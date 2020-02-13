<template lang="pug">
extends Basic.pug
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import Basic from './Basic.vue'

@Component
export default class Custom extends Basic {}
</script>
