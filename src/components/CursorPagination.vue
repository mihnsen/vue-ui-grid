<template lang="pug">
nav.vgrid-pagination.vgrid-pagination--cursor(v-if="meta")
  ul
    li(
      v-for="(item, index) in pages",
      :class="{ disabled: item.disable }",
      :key="index"
    )
      a(
        href="javascript:;",
        @click="onPageChange(item.page)",
        v-html="item.label"
        :title="item.title",
      )
</template>

<script lang="ts">
import { Component, Prop, PropSync, Emit, Vue } from 'vue-property-decorator'
import Page from '../interfaces/page'

@Component({
  model: {
    prop: 'value',
    event: 'update:value'
  }
})
export default class CursorPagination extends Vue {
  @PropSync('value')
  currentPage!: any

  @Prop({})
  meta!: any

  @Emit()
  onPageChange(page: number) {
    this.currentPage = page
  }

  get pages() {
    const result: Page[] = [
      {
        label: '&lsaquo;',
        page: this.meta.prev_cursor,
        disable: !this.meta.prev_cursor,
        title: 'Previous'
      },
      {
        label: '&rsaquo;',
        page: this.meta.next_cursor,
        disable: !this.meta.next_cursor,
        title: 'Next'
      }
    ]

    return result
  }
}
</script>
