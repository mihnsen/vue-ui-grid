<template lang="pug">
#app
  img(
    alt="Vue logo"
    src="./assets/logo.png"
  )
  div(style="width: 1000px; margin: 20px auto 50px")
    VAjaxCards(
      search-field="name",
      resource="programmes",
      :per-page="2",
      :columns="gridColumns",
      :orderable="true"
    )
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class GraphqlApp extends Vue {
  gridColumns = [
    {
      field: 'name',
      label: 'Program name',
      order: true,
      width: 3
    },
    {
      field: 'aim',
      label: 'Program aim',
      order: true,
      width: 3
    },
    {
      field: 'logo',
      format: '<img src="{logo}" class="img-fluid" />',
      label: 'Logo',
      width: 1
    },
    {
      field: 'action',
      label: 'Program aim'
    }
  ]
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
