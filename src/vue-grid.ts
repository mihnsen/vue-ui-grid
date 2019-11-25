import Grid from './Grid.vue'
import Cards from './Cards.vue'
import List from './List.vue'
import GraphGrid from './GraphGrid.vue'

const Plugin = {
  install(Vue: any, options: any = {}) {
    console.log('here', options)
    Vue.component('VGrid', Grid)
    Vue.component('VList', List)

    if (options.graphql) {
      Vue.component('VGraphGrid', GraphGrid)

      Vue.prototype.$graphGrid = {
        filterKey: options.filterKey || 'where',
        limitKey: options.limitKey || 'limit',
        offsetKey: options.offsetKey || 'offset',
        graphqlFilter: options.graphqlFilter,
        graphqlOrder: options.graphqlOrder,
        graphqlDataCounter: options.graphqlDataCounter
      }
    }

    // TODO option ajax
  }
}

export {
  Grid,
  Cards,
  List,
  GraphGrid
}

export default Plugin
