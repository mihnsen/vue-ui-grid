<script lang="ts">
import Vue from 'vue'

import Basic from './column-types/Basic.vue'
import DateTime from './column-types/DateTime.vue'
import Timestamp from './column-types/Timestamp.vue'
import Custom from './column-types/Custom.vue'

export default Vue.extend({
  name: 'GridColumn',
  functional: true,
  props: {
    column: {
      type: Object,
      required: true
    },
    data: {
      type: Object,
      required: true
    }
  },
  render: (createElement, context) => {
    const appropriateTypeComponent = () => {
      const { column } = context.props
      let { type } = column
      let columnLayout = Basic

      switch (type) {
        case 'datetime':
          columnLayout = DateTime
          break
        case 'timestamp':
          columnLayout = Timestamp
          break
        case 'custom':
          columnLayout = Custom
          break
        default:
          break
      }

      return columnLayout
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
