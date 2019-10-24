<script lang="ts">
import Vue from 'vue'

import Basic from './column-filters/Basic.vue'
import DateTime from './column-filters/DateTime.vue'
import Dropdown from './column-filters/Dropdown.vue'

export default Vue.extend({
  name: 'GridColumnFilter',
  functional: true,
  props: {
    column: {
      type: Object,
      required: true
    }
  },
  render: (createElement, context) => {
    const appropriateTypeComponent = () => {
      const { column } = context.props

      if (column.searchType === 'dropdown') {
        return Dropdown
      }

      let filterLayout = null

      switch (column.type) {
        case 'datetime':
          filterLayout = DateTime
          break
        default:
          filterLayout = Basic
          break
      }

      return filterLayout
    }

    return createElement(
      appropriateTypeComponent(),
      {
        ...context.data,
        props: context.props
      },
      context.children
    )
  }
})
</script>
