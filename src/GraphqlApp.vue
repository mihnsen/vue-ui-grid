<template lang="pug">
#app
  img(
    alt="Vue logo"
    src="./assets/logo.png"
  )
  div(style="width: 1000px; margin: 20px auto 50px")
    VGraphList(
      resource="ie_programs",
      resource-meta="ie_programs_aggregate",
      search-field="name",
      sort-by="updated_at",
      :columns="columns",
      :orderable="true"
    )
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class GraphqlApp extends Vue {
  columns = [
    {
      field: '_id',
      type: 'hidden'
    },
    {
      field: 'name',
      label: 'Name',
      type: 'string',
      order: true,
      class: 'mb-3',
      width: 7
    },
    {
      field: 'updated_at',
      label: 'Last edit',
      order: true,
      format: (program: any) => {
        return DateTime.fromISO(program.updated_at, {
          zone: 'UTC'
        })
          .toLocal()
          .toLocaleString(DateTime.DATE_FULL)
      },
      class: 'vgrid-align-right',
      width: 5
    },
    {
      field: 'description',
      label: 'Description',
      width: 9
    },
    {
      field: 'action',
      type: 'custom',
      label: 'Action',
      width: 3
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
