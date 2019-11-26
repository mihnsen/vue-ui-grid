import Vue from 'vue'
import App from './App.vue'
import TestVue from './TestVue.vue'
import GraphqlApp from './GraphqlApp.vue'
import AjaxApp from './AjaxApp.vue'
import apolloProvider from './apollo-provider'
import VueUIGrid from './vue-grid'
import axios from 'axios'

Vue.config.productionTip = false

axios.defaults.baseURL = 'http://localhost:3091/api/'

Vue.use(VueUIGrid, {
  graphql: true,
  ajax: true,
  fetchData: axios.get,
  extractData: (responseData: any) => {
    const data = responseData.data
    return {
      items: data.items,
      total: data.totalItems
    }
  },
  getPageIndex: (index: number) => (index + 1),

  filterKey: 'filter',
  limitKey: 'last',
  offsetKey: 'skip',
  graphqlFilter(column: any, value: string) {
    let result = ''

    if (column) {
      result = `${column.field}_contains: "${value}"`
    }

    return result
  },
  graphqlOrder(by: string, type: string) {
    console.log(by, type)
    const typeStr = type.toUpperCase()
    return `orderBy: ${by}_${typeStr}`
  },
  graphqlDataCounter: (data: any) => data.count
})

new Vue({
  apolloProvider,
  render: h => h(AjaxApp)
}).$mount('#app')
