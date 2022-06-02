<template>
  <h1> Vue Grid </h1>
  <p class="toplink">
    <!-- use router-link component for navigation. -->
    <!-- specify the link by passing the `to` prop. -->
    <!-- `<router-link>` will be rendered as an `<a>` tag by default -->
    <router-link to="/">Go to Json</router-link>
    <router-link to="/ajax">Go to Ajax</router-link>
    <router-link to="/graph">Go to Graph</router-link>
  </p>
  <RouterView></RouterView>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style scoped>

.toplink a + a {
  margin-left: 1em;
}
</style>
