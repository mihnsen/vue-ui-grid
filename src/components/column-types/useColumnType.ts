import { computed } from 'vue'
import { getData } from '../../use/GetData'

export default function(props) {
  const text = computed(() => {
    if (props.column.format) {
      if (typeof props.column.format === 'function') {
        return props.column.format(props.data)
      } else {
        return props.column.format.replace(/\{(\w*)\}/g, (matched: string, field: string) => {
          return getData(field, props.data)
        })
      }
    }

    return getData(props.column.field, props.data)
  })

  const classes = computed(() => {
    const type = props.column.type || 'text'
    const { field } = props.column

    const classes = [
      `vgrid-column-type--${type}`,
      `vgrid-column-data--${field}`
    ]

    if (props.resize && props.column.width) {
      classes.push(`vgrid-field--${props.column.width}`)
    }

    if (props.column.class) {
      classes.push(props.column.class)
    }

    return classes
  })

  return {
    text,
    classes,
  }
}
