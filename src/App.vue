<template lang="pug">
  #app
    img(
      alt="Vue logo"
      src="./assets/logo.png"
    )
    div(style="width: 1000px; margin: 20px auto 50px")
      Grid.vgrid-center(
        :columns="gridColumns",
        :data="gridData",
        :per-page="10",
        :column-visible="true",
        :orderable="true",
        ref="grid"
      )
        template(
          slot="column-action"
          slot-scope="{ entry }"
        )
          button(
            type="button",
          ) ADD
        template(
          slot="header-end"
        )
          button(
            type="button",
          ) Export
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
            href="gooogle.com"
          ) Edit
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Grid, List } from './vue-grid'
import sample from './sample'

@Component({
  components: {
    Grid,
    List
  }
})
export default class App extends Vue {
  gridColumns = [
    {
      field: 'id',
      label: 'ID',
      filter: true,
      hidden: true,
      width: 3
    },
    {
      field: 'name',
      label: 'Name',
      format: '<strong>Q. {id} - {name} - {salary}</strong>',
      filter: true,
      width: 3
    },
    {
      field: 'salary',
      label: 'Salary',
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
