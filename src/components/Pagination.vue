<template lang="pug">
nav.vgrid-pagination(v-if="totalPage > 1")
  ul
    li(
      v-for="(item, index) in pages",
      :class="{ active: item.page === currentPage, disabled: item.disable }",
      :key="index"
    )
      a(
        href="javascript:;",
        @click="onPageChange(item.page)",
        v-html="item.label"
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
export default class Pagination extends Vue {
  @PropSync('value', { type: Number })
  currentPage!: number

  @Prop({
    default: 10,
    type: Number
  })
  limit!: number

  @Prop({
    default: 0,
    type: Number
  })
  total!: number

  @Emit()
  onPageChange(page: number) {
    this.currentPage = page
  }

  get totalPage() {
    if (!(this.total % this.limit)) {
      return this.total / this.limit
    }

    return Math.floor(this.total / this.limit) + 1
  }

  get pages() {
    const step = [-2, -1, 0, 1, 2].map((i) => i + this.currentPage)
    // prev button.
    const result: Page[] = [
      {
        label: '&laquo;',
        page: this.currentPage - 1,
        disable: this.currentPage === 0
      }
    ]

    // 5 pages in the middle.
    // eslint-disable-next-line no-restricted-syntax
    for (const i of step) {
      if (i >= 0 && i < this.totalPage) {
        if (i === 0) {
          result.push({
            label: '1',
            page: 0
          })
        } else if (i === this.currentPage) {
          result.push({
            label: i + 1,
            page: i
          })
        } else {
          result.push({
            label: i + 1,
            page: i
          })
        }
      }
    }

    // next button.
    result.push({
      label: '&raquo;',
      page: this.currentPage + 1,
      disable: this.currentPage === this.totalPage - 1
    })

    if (this.totalPage > 5) {
      // first button.
      if (this.currentPage > 2) {
        result.splice(1, 0, {
          label: '1 ...',
          page: 0
        })
      }

      // last button.
      if (this.currentPage < this.totalPage - 3) {
        result.splice(result.length - 1, 0, {
          label: `... ${this.totalPage}`,
          page: this.totalPage - 1
        })
      }
    }

    return result
  }
}
</script>
