import type { App, Component } from 'vue';

import VGrid from './components/grid/BasicGrid.vue'
import VCards from './components/grid/BasicCards.vue'
import VList from './components/grid/BasicList.vue'

import VAjaxGrid from './components/grid/AjaxGrid.vue'
// import VAjaxList from './components/grid/AjaxList.vue'
// import VAjaxCards from './components/grid/AjaxCards.vue'

import VGraphGrid from './components/grid/GraphGrid.vue'
// import VGraphList from './components/grid/GraphList.vue'
// import VGraphCards from './components/grid/GraphCards.vue'

import Pagination from './components/Pagination.vue'

import './assets/scss/_index.scss'

const VueGridPlugin = {
  install(Vue: App, options: any = {}) {
    Vue.component('VGrid', VGrid)
    Vue.component('VList', VList)
    Vue.component('VCards', VCards)

    const gridOption = {
      debug: options.debug,
      perPage: options.perPage,
      pageSizes: options.pageSizes,
      routeState: options.routeState
    }

    let graphqlOption = {}
    let ajaxOption = {}

    if (options.ajax) {
      Vue.component('VAjaxGrid', VAjaxGrid)
      // Vue.component('VAjaxList', VAjaxList)
      // Vue.component('VAjaxCards', VAjaxCards)

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

    if (options.graphql) {
      Vue.component('VGraphGrid', VGraphGrid)
      // Vue.component('VGraphList', VGraphList)
      // Vue.component('VGraphCards', VGraphCards)

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
  VGrid,
  VCards,
  VList,
  VAjaxGrid,
  VAjaxCards,
  VAjaxList,
  VGraphGrid,
  // VGraphCards,
  // VGraphList,
  Pagination
};

// Export all
export default VueGridPlugin;
