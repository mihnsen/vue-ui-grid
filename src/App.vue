<template lang="pug">
  #app
    img(
      alt="Vue logo"
      src="./assets/logo.png"
    )
    div(style="width: 1000px; margin: 20px auto 50px")
      Grid(
        :columns="gridColumns",
        :data="gridData",
        :per-page="6",
        :column-visible="true",
        :orderable="true",
        :route-state="true",
        ref="grid"
      )
        template(#column-action="{ entry }")
          button(
            type="button",
            @click="remove(entry)"
          ) remove
        template(
          slot="header-end"
        )
          button(
            type="button",
          ) Export
    div(style="width: 1000px; margin: 20px auto")
      Cards(
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
      List(
        :columns="listColumns",
        :data="listData",
        :per-page="10",
        :column-visible="true",
        :orderable="true",
        :pagination="false",
        ref="list"
      )
        template(
          slot="column-action"
          slot-scope="{ entry }"
        )
          button(
            type="button",
          ) ADD
          a(
            href="javascript:;"
          ) Edit
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Grid, List, Cards } from './vue-grid'
import sample from './sample'

@Component({
  components: {
    Grid,
    Cards,
    List
  }
})
export default class App extends Vue {
  gridColumns = [
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
      filter: true
    },
    {
      type: 'number',
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
      filter_type: 'checkboxes',
      filter_data: [
        {
          value: 'Edinburgh',
          label: 'EDIN BURGHERE HEREE'
        },
        {
          value: 'New York',
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
  ];

  listColumns = [
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
      order: true
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
  ]

  gridData = [
    ...sample
  ]

  listData = [
    ...sample
  ]

  remove(entry: any) {
    this.gridData = this.gridData.filter((e) => e.id !== entry.id)
  }
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
