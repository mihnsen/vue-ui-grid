<template lang="pug">
.vgrid.vgrid-list
  .vgrid-header
    slot(name="header-start")
    GridFilter(
      v-if="filterable && hasColumnFilter",
      v-model="where",
      :columns="columns"
    )
    GridSearch(
      v-model="searchKeyword",
      v-if="searchable"
    )
    GridOrder.vgrid-ml-auto(
      v-if="orderable && hasColumnOrder",
      v-model="order",
      :columns="columns"
    )
    ColumnsVisibility.vgrid-ml-auto(
      v-if="columnVisible"
      :columns="columns",
      v-model="columnVisibility",
    )
    ExportButton.vgrid-ml-auto(
      v-if="exportable"
      :columns="visibleCols",
      :data="data",
      :file-name="exportFileName"
    )
    slot(name="header-end")
  .vgrid-body
    .vgrid-nodata(
      v-if="!total",
    )
      span(v-if="!isFiltered") {{ strEmptyData }}
      span(v-else) {{ strEmptyFilteredData }}
    .vgrid-entry-wrapper(
      v-for="entry in showedData",
    )
      slot(
        :entry="entry",
        :visible-cols="visibleCols"
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
    PageSize(
      v-if="pagination",
      v-model="limit"
    )
    GridStatus(
      :v-if="status",
      :limit="limit",
      :current-page="currentPage",
      :showed="showedData.length",
      :total="total"
    )
    Pagination(
      v-if="pagination",
      v-model="currentPage",
      :limit="limit",
      :total="total",
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
