import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export default function(props, localValue, el) {
  const isEditor = ref(false)

  const stopClick = () => {}

  const classes = computed(() => {
    const type = props.column.type || 'text'
    const { field } = props.column
    const classes = [`column-type-${type}`, `column-data-${field}`]
    if (localValue.value) {
      classes.push('active')
    }
    return classes
  })

  const placeholder = computed(() => {
    return `Find ${props.column.label}`
  })

  const showEditor = () => {
    // Dispatch event to hide other filter editor
    document.dispatchEvent(new Event('vgrid-filter-editor'))
    // Then open current editor
    isEditor.value = true

    if (el) {
      setTimeout(() => {
        el.value.focus()
      }, 100)
    }
  }

  const onEnter = () => {
    isEditor.value = false
  }

  const handleBodyClick = () => {
    isEditor.value = false
  }

  onMounted(() => {
    document.body.addEventListener('click', handleBodyClick)
    document.addEventListener('vgrid-filter-editor', handleBodyClick)
  })

  onBeforeUnmount(() => {
    document.body.removeEventListener('click', () => {}, false)
    document.removeEventListener('vgrid-filter-editor', handleBodyClick)
  })

  return {
    isEditor,
    stopClick,
    classes,
    placeholder,
    showEditor,
    onEnter,
  }
}
