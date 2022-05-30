import type { App, Component } from 'vue';

import Grid from './components/grid/BasicGrid.vue'
import Cards from './components/grid/BasicCards.vue'
import List from './components/grid/BasicList.vue'

// import AjaxGrid from './components/grid/AjaxGrid.vue'
// import AjaxList from './components/grid/AjaxList.vue'
// import AjaxCards from './components/grid/AjaxCards.vue'

// import GraphGrid from './components/grid/GraphGrid.vue'
// import GraphList from './components/grid/GraphList.vue'
// import GraphCards from './components/grid/GraphCards.vue'

import Pagination from './components/Pagination.vue'

import './assets/scss/_index.scss'

const VueGridPlugin = {
  install(Vue: App, options: any = {}) {
    Vue.component('VGrid', Grid)
    Vue.component('VList', List)
    Vue.component('VCards', Cards)

    const gridOption = {
      debug: options.debug,
      perPage: options.perPage,
      pageSizes: options.pageSizes,
      routeState: options.routeState
    }

    let graphqlOption = {}
    let ajaxOption = {}

    if (options.graphql) {
      // Vue.component('VGraphGrid', GraphGrid)
      // Vue.component('VGraphList', GraphList)
      // Vue.component('VGraphCards', GraphCards)

      graphqlOption = {
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
      // Vue.component('VAjaxGrid', AjaxGrid)
      // Vue.component('VAjaxList', AjaxList)
      // Vue.component('VAjaxCards', AjaxCards)

      ajaxOption = {
        extractData: options.extractData,
        pageKey: options.pageKey || 'page',
        hasSortType: options.hasSortType,
        sortKey: options.sortKey || 'sort',
        sortTypeKey: options.sortTypeKey || 'sort_type',
        perPageKey: options.perPageKey || 'limit',
        fetchData: options.fetchData,
        cancelToken: options.cancelToken,

        // Funcs
        getPageIndex: options.getPageIndex
      }
    }

    const vueGridOptions = {
      ...gridOption,
      ...ajaxOption,
      ...graphqlOption
    }


    Vue.provide('$vgrid', vueGridOptions);
  }
}

// Export VField
export {
  Grid,
  Cards,
  List,
  // AjaxGrid,
  // AjaxCards,
  // AjaxList,
  // GraphGrid,
  // GraphCards,
  // GraphList,
  Pagination
};

// Export all
export default VueGridPlugin;
