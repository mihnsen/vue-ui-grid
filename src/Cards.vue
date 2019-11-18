<template lang="pug">
.vgrid.vgrid-cards
  .vgrid-header
    slot(name="header-start")
    GridSearch(
      v-model="searchKeyword",
      v-if="searchable"
    )
    GridFilter(
      v-if="filterable && hasColumnFilter",
      v-model="where",
      :columns="columns"
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
      v-if="!showedData.length",
    )
      span(v-if="!total") {{ strEmptyData }}
      span(v-else) {{ strEmptyFilteredData }}
    .vgrid-row
      .vgrid-col(
        :class="columnClasses",
        v-for="entry in showedData"
      )
        slot(
          :entry="entry",
          :visible-cols="visibleCols"
        )
          .vgrid-entry-wrapper
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
      :total="totalFiltered"
    )
    Pagination(
      v-if="pagination",
      v-model="currentPage",
      :limit="limit",
      :total="totalFiltered",
    )
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import Grid from './Grid.vue'

@Component({
  name: 'VCards'
})
export default class VCards extends Grid {
  @Prop({ default: 2 })
  colMd!: number

  @Prop({ default: 3 })
  colLg!: number

  @Prop({ default: 4 })
  colXl!: number

  get columnClasses() {
    return [
      `vgrid-col-md-${this.colMd}`,
      `vgrid-col-lg-${this.colLg}`,
      `vgrid-col-xl-${this.colXl}`
    ]
  }
}
</script>
