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
      search-field="title",
      :columns="columns",
      :per-page="5",
      offset-key="skip",
      limit-key="last",
      filter-key="filter",
      sort-by="id",
      sort-type="asc"
      :exportable="true"
      :route-state="true"
    )
    // VGraphCards(
    //   resource="catalogs",
    //   resource-meta="catalogs_aggregate",
    //   :columns="columns",
    //   offset-key="skip",
    //   limit-key="last",
    //   filter-key="filter",
    // )
    // VGraphList(
    //   resource="catalogs",
    //   resource-meta="catalogs_aggregate",
    //   :columns="columns",
    //   offset-key="skip",
    //   limit-key="last",
    //   filter-key="filter",
    // )
</template>
<script setup lang="ts">
import { ref } from 'vue'

const columns = ref([
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
    // filter: true,
    order: true
  },
  {
    field: 'fulfillment.id',
    // type: 'hidden',
    field_type: 'id',
    label: 'Fulfillment',
    filter: true,
    filter_type: 'radio',
    filter_value: [
      {
        id: 1,
        label: 'CustomCat'
      },
      {
        id: 2,
        label: 'Printful'
      },
      {
        id: 6,
        label: 'Dreamship'
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
])
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
