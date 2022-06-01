import { computed } from 'vue'

export default function(props) {
  const classes = computed(() => {
    const type = props.column.type || 'text'
    const { field } = props.column

    return [`column-type-${type}`, `column-data-${field}`]
  })

  return {
    classes,
  }
}
