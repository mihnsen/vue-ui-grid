<template>
<div>
  <p>
    <!-- use router-link component for navigation. -->
    <!-- specify the link by passing the `to` prop. -->
    <!-- `<router-link>` will be rendered as an `<a>` tag by default -->
    <router-link to="/">Go to Json</router-link>
    <router-link to="/ajax">Go to Ajax</router-link>
    <router-link to="/graph">Go to Graph</router-link>
  </p>
  <router-view></router-view>
</div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class MainApp extends Vue {

}
</script>
