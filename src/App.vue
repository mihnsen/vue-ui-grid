<template lang="pug">
  #app
    img(
      alt="Vue logo"
      src="./assets/logo.png"
    )
    div(style="width: 800px; margin: 20px auto")
      Grid(
        :columns="gridColumns",
        :data="gridData"
      )
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Grid from './components/Grid.vue'

@Component({
  components: {
    Grid
  }
})
export default class App extends Vue {
  gridColumns = [
    {
      field: 'name',
      lable: 'Actor'
    },
    {
      field: 'power',
      lable: 'Power'
    }
  ];

  gridData = [
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
