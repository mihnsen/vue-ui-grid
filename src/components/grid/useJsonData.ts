import { watch, computed } from 'vue'
import { JsonDataProvider } from '../../data-providers'
import useOption from './useOption'

export default function(props, option, dataCallback) {
  const baseOptions = useOption(props);

  const gridOption = computed(() => ({
    ...baseOptions.value,
    ...option,
  }))

  const dataProvider = new JsonDataProvider(props.data, gridOption.value)

  const setDataCollections = () => {
    dataProvider.updateData(props.data)
    dataCallback()
    // TODO getData
    // getData()
  }

  watch(
    () => props.data,
    () => {
      setDataCollections()
    },
  )

  return {
    dataProvider,
    gridOption,
    setDataCollections,
  }
}
