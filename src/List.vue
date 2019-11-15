<template lang="pug">
.vgrid.vgrid-list
  .vgrid-header
    .vgrid-row
      .vgrid-col
        GridSearch(
          v-model="searchKeyword",
          v-if="searchable"
        )
        GridFilter(
          v-if="filterable && hasColumnFilter",
          v-model="where",
          :columns="columns"
        )
      .vgrid-col.vgrid-ml-auto.vgrid-align-right
        GridOrder(
          v-if="orderable && hasColumnOrder",
          v-model="order",
          :columns="columns"
        )
        ColumnsVisibility(
          v-if="columnVisible"
          :columns="columns",
          v-model="columnVisibility",
        )
  .vgrid-body
    .vgrid-nodata(
      v-if="!showedData.length",
    )
      span {{ strEmptyData }}
    .vgrid-row(
      v-for="entry in showedData",
    )
      ColumnType(
        v-for="col in visibleCols"
        :column="col",
        :data="entry",
        :key="col.id",
        :resize="true",
        :class="columnClasses[col.field]",
      )
        slot(:name="'column-' + col.field", :entry="entry")
  .vgrid-footer
    .vgrid-row
      .vgrid-col.vgrid-col-4
        PageSize(
          v-if="pagination",
          v-model="limit"
        )
      .vgrid-col.vgrid-col-4.vgrid-align-center
        GridStatus(
          :v-if="status",
          :limit="limit",
          :current-page="currentPage",
          :showed="showedData.length",
          :total="totalFiltered"
        )
      .vgrid-col.vgrid-col-4.vgrid-align-right
        Pagination(
          v-if="pagination",
          v-model="currentPage",
          :limit="limit",
          :total="totalFiltered",
        )
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator'
import Grid from './Grid.vue'

@Component({
  name: 'VList'
})
export default class VList extends Grid {}
</script>
