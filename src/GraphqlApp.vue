<template lang="pug">
#app
  img(
    alt="Vue logo"
    src="./assets/logo.png"
  )
  div(style="width: 1000px; margin: 20px auto 50px")
    VGraphGrid(
      resource="products",
      resource-meta="products_aggregate",
      resource-meta-query="count",
      ref-query="instance { platform_domain, shop_id }"
      :columns="columns",
      :orderable="true"
      :per-page="5",
      offset-key="skip",
      limit-key="last",
      filter-key="filter",
    )
    // VGraphCards(
    //   resource="allAssets",
    //   resource-meta="_allAssetsMeta",
    //   resource-meta-query="count",
    //   :columns="columns",
    //   :orderable="true"
    //   offset-key="skip",
    //   limit-key="last",
    //   filter-key="filter",
    // )
    // VGraphList(
    //   resource="allAssets",
    //   resource-meta="_allAssetsMeta",
    //   resource-meta-query="count",
    //   :columns="columns",
    //   :orderable="true"
    //   offset-key="skip",
    //   limit-key="last",
    //   filter-key="filter",
    // )
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class GraphqlApp extends Vue {
  columns = [
    {
      field: 'id',
      type: 'hidden'
    },
    {
      field: 'name',
      label: 'Name',
      format: '{name}',
      width: 4,
      order: true,
      class: 'mb-3'
    },
    {
      field: 'linked_product',
      label: 'Linked product',
      width: 3,
      order: true
    },
    {
      field: 'updated_at',
      label: 'Last edit',
      order: true,
      width: 2
    },
    {
      type: 'custom',
      label: 'Myshopify domain',
      format: (entry: any) => {
        return entry.instance.platform_domain
      },
      width: 3
    },
    {
      field: 'action',
      type: 'custom',
      label: 'Action',
      width: 2
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
