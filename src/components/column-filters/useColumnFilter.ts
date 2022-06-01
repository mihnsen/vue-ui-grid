import { computed } from 'vue'

export default function(props) {
  const classes = computed(() => {
    const type = props.column.type || 'text'
    const { field } = props.column

    return [`vgrid-column-type--${type}`, `vgrid-column-data--${field}`]
  })

  return {
    classes,
  }
}
