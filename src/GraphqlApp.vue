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
      search-field="name",
      :columns="columns",
      :orderable="true"
      :per-page="5",
      offset-key="skip",
      limit-key="last",
      filter-key="filter",
    )
    VGraphCards(
      resource="allAssets",
      resource-meta="products_aggregate",
      resource-meta-query="count",
      :columns="columns",
      :orderable="true"
      offset-key="skip",
      limit-key="last",
      filter-key="filter",
    )
    VGraphList(
      resource="allAssets",
      resource-meta="products_aggregate",
      resource-meta-query="count",
      :columns="columns",
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
      filter: true,
      class: 'mb-3'
    },
    {
      field: 'linked_product',
      label: 'Linked product',
      order: true
    },
    {
      field: 'updated_at',
      label: 'Last edit',
      order: true
    },
    {
      field: 'instance.platform_domain',
      label: 'Myshopify domain',
      filter: true
    },
    {
      field: 'instance.shop_id',
      label: 'Shopify shop id',
      filter: true
    },
    {
      field: 'instance.user.email',
      label: 'User email',
      filter: true
    },
    {
      field: 'instance.user.id',
      label: 'User ID'
    },
    {
      field: 'instance.platform.display_name',
      label: 'Platform long long name'
    },
    // {
    //   field: 'orders.count',
    //   label: 'Number of orders',
    //   width: 3
    // },
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
