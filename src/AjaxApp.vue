<template lang="pug">
#app
  div(style="width: 1000px; margin: 20px auto 50px")
    VAjaxGrid(
      ref="ajaxGrid",
      search-field="name",
      resource="users",
      :columns="gridColumns",
      :orderable="true",
      :per-page="6",
      :exportable="true",
    )
      template(#column-action="{ entry }")
        button(
          type="button",
          @click="remove(entry)"
        ) remove
    VAjaxCards(
      search-field="name",
      resource="users",
      :columns="gridColumns",
      :orderable="true",
      :per-page="5"
    )
      template(#column-index="{ index, entry }")
        span #
        span {{index}}
    VAjaxList(
      search-field="name",
      resource="users",
      :columns="gridColumns",
      :orderable="true",
      :per-page="5"
    )
</template>
<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { VAjaxGrid, VAjaxList, VAjaxCards } from './vue-grid';

const ajaxGrid = ref()
const gridColumns = ref([
  {
    field: 'index',
    type: 'custom'
  },
  {
    field: 'avatar',
    label: 'Avatar',
    format: '<img src="{avatar}" class="vgrid-img-fluid" />',
    width: 2
  },
  {
    field: 'id',
    label: 'ID',
    width: 1
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
    field: 'first_name',
    label: 'First name',
    format: '{first_name} {last_name}',
    order: true,
    width: 3
  },
  {
    field: 'email',
    label: 'Email',
    order: true,
    width: 9
  },
  {
    field: 'action',
    label: 'Action',
    width: 3
  }
])

const remove = (entry: any) => {
  axios.delete(`/users/${entry.id}`)
    .then((res) => {
      // TODO
      ajaxGrid.value.getData()
    })
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
