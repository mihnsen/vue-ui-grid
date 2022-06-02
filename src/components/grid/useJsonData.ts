import { watch, reactive } from 'vue'
import { JsonDataProvider } from '../../data-providers'
import useOption from './useOption'

export default function(props, option, dataCallback) {
  const gridOption = reactive({
    ...useOption(props),
    ...option,
  })
  const dataProvider = new JsonDataProvider(props.data, gridOption)
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
