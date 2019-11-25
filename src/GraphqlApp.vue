<template lang="pug">
#app
  img(
    alt="Vue logo"
    src="./assets/logo.png"
  )
  div(style="width: 1000px; margin: 20px auto 50px")
    VGraphGrid(
      resource="allAssets",
      resource-meta="_allAssetsMeta",
      resource-meta-query="count",
      :columns="gridColumns",
      :orderable="true"
      :per-page="5",
      offset-key="skip",
      limit-key="last",
      filter-key="filter",
    )
    VGraphCards(
      resource="allAssets",
      resource-meta="_allAssetsMeta",
      resource-meta-query="count",
      :columns="gridColumns",
      :orderable="true"
      offset-key="skip",
      limit-key="last",
      filter-key="filter",
    )
    VGraphList(
      resource="allAssets",
      resource-meta="_allAssetsMeta",
      resource-meta-query="count",
      :columns="gridColumns",
      :orderable="true"
      offset-key="skip",
      limit-key="last",
      filter-key="filter",
    )
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class GraphqlApp extends Vue {
  gridColumns = [
    {
      field: 'id',
      label: 'ID',
      filter: true,
      hidden: true
    },
    {
      field: 'fileName',
      label: 'Name',
      format: '<strong>{fileName}</strong>',
      width: 6,
      order: true,
      filter: true
    },
    {
      field: 'handle',
      label: 'Handle',
      width: 3,
      order: true,
      filter: true
    },
    {
      field: 'url',
      width: 4,
      format: '<img src="{url}" width="80" />',
      order: true
    },
    {
      field: 'action',
      type: 'custom'
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
