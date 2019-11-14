<template lang="pug">
  #app
    img(
      alt="Vue logo"
      src="./assets/logo.png"
    )
    div(style="width: 800px; margin: 20px auto 50px")
      Grid.vgrid-center(
        :columns="gridColumns",
        :data="gridData",
        :per-page="2",
        :column-filterable="true",
        :orderable="true",
        ref="grid"
      )
    div(style="width: 800px; margin: 20px auto")
      List(
        :columns="listColumns",
        :data="listData",
        :per-page="2",
        :orderable="true",
        :column-visible="true"
        ref="list"
      )
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Grid, List } from './vue-grid'

@Component({
  components: {
    Grid,
    List
  }
})
export default class App extends Vue {
  gridColumns = [
    {
      field: 'name',
      label: 'Actor',
      order: true
    },
    {
      field: 'power',
      label: 'Power',
      filter: true,
      order: true
    }
  ];

  listColumns = [
    {
      field: 'name',
      label: 'Actor',
      filter: true,
      width: 3
    },
    {
      field: 'power',
      label: 'Power',
      filter: true
    },
    {
      field: 'test',
      label: 'Test',
      filter: true
    }
  ]

  gridData = [
    { name: 'Chuck Norris', power: Infinity },
    { name: 'Bruce Lee', power: 9000 },
    { name: 'Jackie Chan', power: 7000 },
    { name: 'Jet Li', power: 8000 }
  ]

  listData = [
    { name: 'Chuck Norris', power: Infinity },
    { name: 'Bruce Lee', power: 9000 },
    { name: 'Jackie Chan', power: 7000 },
    { name: 'Jet Li', power: 8000 }
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
