<template lang="pug">
#app
  img(
    alt="Vue logo"
    src="./assets/logo.png"
  )
  div(style="width: 1000px; margin: 20px auto 50px")
    VGrid(
      :columns="gridColumns",
      :data="gridData",
      :per-page="6",
      :column-visible="true",
      :column-filterable="true",
      :orderable="true",
      :route-state="true",
      ref="grid"
    )
      template(#column-action="{ entry }")
        button(
          type="button",
          @click="remove(entry)"
        ) remove
      template(#header-end)
        button(
          type="button",
        ) Export
  div(style="width: 1000px; margin: 20px auto")
    VCards(
      :columns="gridColumns",
      :data="gridData",
      :per-page="10",
      :column-visible="true",
      :col-md="4"
      :col-xl="4"
      :col-lg="4"
      ref="list"
      :exportable="true"
    )
      template(#column-action="{ entry }")
        button(
          type="button",
          @click="remove(entry)"
        ) remove
        a(
          href="javascript:;"
        ) Edit
  div(style="width: 1000px; margin: 20px auto")
    VList(
      :columns="listColumns",
      :data="listData",
      :per-page="10",
      :column-visible="true",
      :orderable="true",
      :pagination="false",
      ref="list"
    )
      template(#column-action="{ entry }")
        button(
          type="button",
        ) ADD
        a(
          href="javascript:;"
        ) Edit
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VGrid, VList/*, VCards*/ } from './vue-grid';
import sample from './sample';

const gridColumns = ref([
  {
    field: 'id',
    label: 'ID',
    filter: true,
    hidden: true
  },
  {
    field: 'name',
    label: 'Name',
    format: 'Q. {id} - {name} - {salary}',
    width: 6,
    filter: true
  },
  {
    field: 'salary',
    label: 'Salary',
    format: (entry: any) => `<u/>${entry.salary}</u>`,
    width: 3,
    filter: true,
    order: true
  },
  {
    type: 'datetime',
    field: 'start_date',
    label: 'Start date',
    filter: true,
    width: 4,
    order: true
  },
  {
    field: 'office',
    label: 'Office',
    filter: true,
    filter_type: 'dropdown',
    filter_value: [
      {
        id: 'Edinburgh',
        label: 'EDIN BURGHERE HEREE'
      },
      {
        id: 'New York',
        label: 'New York - USA'
      }
    ],
    order: true
  },
  {
    field: 'extn',
    label: 'Extn',
    filter: true,
    order: true,
    width: 4
  },
  {
    field: 'action',
    type: 'custom'
  }
]);

const listColumns = ref([
  {
    field: 'id',
    label: 'ID',
    filter: true,
    type: 'hidden',
    width: 3
  },
  {
    field: 'name',
    label: 'Name',
    filter: true,
    width: 3
  },
  {
    field: 'salary',
    label: 'Salary',
    hidden: true,
    filter: true
  },
  {
    type: 'number',
    field: 'start_date',
    label: 'Start date',
    filter: true,
    order: true
  },
  {
    field: 'office',
    label: 'Office',
    filter: true,
    filter_type: 'radio',
    filter_value: [
      {
        id: 'Edinburgh',
        label: 'Edinburgh'
      },
      {
        id: 'Tokyo',
        label: 'Tokyo'
      },
      {
        id: 'New York',
        label: 'New York'
      }
    ]
  },
  {
    field: 'extn',
    label: 'Extn',
    filter: true,
    order: true
  },
  {
    field: 'action',
    type: 'custom'
  }
])

const gridData = ref([
  ...sample
]);

const listData = ref([
  ...sample
])

const remove = (entry: any) => {
  gridData.value = gridData.value.filter((e) => e.id !== entry.id)
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
