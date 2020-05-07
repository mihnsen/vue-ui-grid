<template lang="pug">
#app
  img(
    alt="Vue logo"
    src="./assets/logo.png"
  )
  div(style="width: 1000px; margin: 20px auto 50px")
    VGraphGrid(
      resource="catalogs",
      resource-meta="catalogs_aggregate",
      search-field="name",
      :columns="columns",
      :catalogable="true"
      :per-page="5",
      offset-key="skip",
      limit-key="last",
      filter-key="filter",
      sort-by="id",
      sort-type="asc"
    )
    VGraphCards(
      resource="catalogs",
      resource-meta="catalogs_aggregate",
      :columns="columns",
      :catalogable="true"
      offset-key="skip",
      limit-key="last",
      filter-key="filter",
    )
    VGraphList(
      resource="catalogs",
      resource-meta="catalogs_aggregate",
      :columns="columns",
      :catalogable="true"
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
      field: 'id'
    },
    {
      field: 'updated_at',
      label: 'Last edit',
      catalog: true
    },
    {
      field: 'title',
      label: 'Title',
      filter: true
    },
    {
      field: 'fulfillment.id',
      type: 'hidden',
      field_type: 'id',
      label: 'Fulfillment',
      filter: true,
      filter_type: 'dropdown',
      filter_value: [
        {
          id: 1,
          label: 'CustomCat'
        },
        {
          id: 2,
          label: 'Printful'
        }
      ]
    },
    {
      field: 'fulfillment.display_name',
      label: 'Fulfillment name'
    },
    // {
    //   field: 'catalogs.count',
    //   label: 'Number of catalogs',
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
