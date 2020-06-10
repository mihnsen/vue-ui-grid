<template lang="pug">
#app
  img(
    alt="Vue logo"
    src="./assets/logo.png"
  )
  div(style="width: 1000px; margin: 20px auto 50px")
    VAjaxCards(
      ref="ajaxCards",
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
    VAjaxGrid(
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
<script lang="ts">
import axios from 'axios'
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class GraphqlApp extends Vue {
  $refs: any
  gridColumns = [
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
  ]

  remove(entry: any) {
    axios.delete(`/users/${entry.id}`)
      .then((res) => {
        // TODO
        console.log(res)
        this.$refs.ajaxCards.getData()
      })
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
