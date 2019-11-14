<script lang="ts">
import Vue from 'vue'

import Basic from './filters/Basic.vue'
import DateTime from './filters/DateTime.vue'

export default Vue.extend({
  name: 'GridFilterItem',
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
