<script lang="ts">
import Vue from 'vue'

import Basic from './filters/Basic.vue'
import DateTime from './filters/DateTime.vue'
import Dropdown from './filters/Dropdown.vue'
import Checkbox from './filters/Checkbox.vue'
import Radio from './filters/Radio.vue'

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

      switch (column.filter_type) {
        case 'datetime':
          filterLayout = DateTime
          break
        case 'dropdown':
          filterLayout = Dropdown
          break
        case 'checkbox':
          filterLayout = Checkbox
          break
        case 'radio':
          filterLayout = Radio
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
