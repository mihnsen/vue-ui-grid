<template lang="pug">
#app
  div(style="width: 1000px; margin: 20px auto 50px")
    input(type="text", v-model="abc")

    VRelayGrid(
      :ref-filter="abc",
      resource="products",
      search-field="title",
      :columns="columns",
      :per-page="25",
      offset-key="skip",
      limit-key="last",
      filter-key="filter",
      :orderable="true",
      sort-by="id",
      sort-type="desc"
      :route-state="true",
      :exportable="true"
    )
    // VRelayCards(
    //   resource="products",
    //   resource-meta="products_aggregate",
    //   :columns="columns",
    //   offset-key="skip",
    //   limit-key="last",
    //   filter-key="filter",
    // )
    // VRelayList(
    //   resource="products",
    //   resource-meta="products_aggregate",
    //   :columns="columns",
    //   offset-key="skip",
    //   limit-key="last",
    //   filter-key="filter",
    // )
</template>
<script setup lang="ts">
import { ref } from 'vue'

const abc = ref('')

const columns = ref([
  {
    field: 'id',
    label: 'ID',
    order: true,
  },
  {
    field: 'created_at',
    label: 'Create at',
    order: true
  },
  {
    field: 'updated_at',
    label: 'Last edit',
    order: true
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
