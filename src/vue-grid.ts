import Grid from './components/grid/BasicGrid.vue'
import Cards from './components/grid/BasicCards.vue'
import List from './components/grid/BasicList.vue'

import AjaxGrid from './components/grid/AjaxGrid.vue'
import AjaxList from './components/grid/AjaxList.vue'
import AjaxCards from './components/grid/AjaxCards.vue'

import GraphGrid from './components/grid/GraphGrid.vue'
import GraphList from './components/grid/GraphList.vue'
import GraphCards from './components/grid/GraphCards.vue'

import './assets/scss/_index.scss'

const Plugin = {
  install(Vue: any, options: any = {}) {
    Vue.component('VGrid', Grid)
    Vue.component('VList', List)
    Vue.component('VCards', Cards)

    if (options.graphql) {
      Vue.component('VGraphGrid', GraphGrid)
      Vue.component('VGraphList', GraphList)
      Vue.component('VGraphCards', GraphCards)

      Vue.prototype.$graphGrid = {
        filterKey: options.filterKey || 'where',
        limitKey: options.limitKey || 'limit',
        offsetKey: options.offsetKey || 'offset',
        aggregateQuery: options.aggregateQuery || 'aggregate { count }',
        graphqlFilter: options.graphqlFilter,
        graphqlOrder: options.graphqlOrder,
        graphqlDataCounter: options.graphqlDataCounter
      }
    }

    if (options.ajax) {
      Vue.component('VAjaxGrid', AjaxGrid)
      Vue.component('VAjaxList', AjaxList)
      Vue.component('VAjaxCards', AjaxCards)

      Vue.prototype.$ajaxGrid = {
        extractData: options.extractData,
        pageKey: options.pageKey || 'page',
        sortKey: options.sortKey || 'sort',
        sortTypeKey: options.sortTypeKey,
        perPageKey: options.perPageKey || 'limit',
        fetchData: options.fetchData || 'limit',

        // Funcs
        getPageIndex: options.getPageIndex
      }
    }
  }
}

export {
  Grid,
  Cards,
  List
}

export default Plugin
