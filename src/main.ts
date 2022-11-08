import Vue from 'vue'
import App from './App.vue'
import TestVue from './TestVue.vue'
import GraphqlApp from './GraphqlApp.vue'
import AjaxApp from './AjaxApp.vue'
import MainApp from './MainApp.vue'
import apolloProvider from './apollo-provider'
import VueUIGrid from './vue-grid'
import axios from 'axios'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

Vue.config.productionTip = false

axios.defaults.baseURL = 'https://reqres.in/api'
axios.interceptors.response.use((response) => {
  return response
}, (error) => {
  // Do something with response error
  if (error.response && error.response.status === 401) {
    // TODO logout
  }

  return Promise.reject(error.response)
})

Vue.use(VueUIGrid, {
  debug: true,
  ajax: true,
  fetchData: axios.get,
  cancelToken: axios.CancelToken,
  pageKey: 'page',
  cursorKey: 'cursor',
  perPageKey: 'per_page',
  extractData: (responseData: any) => {
    const data = responseData.data
    return {
      items: data.data,
      total: data.total,
      meta: null
    }
  },
  getPageIndex: (index: number) => (index + 1),

  graphql: true,
  // filterKey: 'filter',
  // limitKey: 'last',
  // offsetKey: 'skip',
  // graphqlFilter(column: any, value: string) {
  //   let result = ''

  //   if (column) {
  //     result = `${column.field}_contains: "${value}"`
  //   }

  //   return result
  // },
  // graphqlOrder(by: string, type: string) {
  //   console.log(by, type)
  //   const typeStr = type.toUpperCase()
  //   return `orderBy: ${by}_${typeStr}`
  // },
  // aggregateQuery: 'count',
  // graphqlDataCounter: (data: any) => data.count

  graphqlFilter(field: string, fieldType: string, value: any, filterType: string) {
    let result = ''

    if (field) {
      if (filterType === 'checkbox') {
        result = `${field}: { _in: [${value.join(', ')}] }`
      } else if (fieldType === 'uuid' || fieldType === 'id') {
        result = `${field}: { _eq: "${value}" }`
      } else {
        result = `${field}: { _ilike: "%${value}%" }`
      }
    }

    return result
  },
  graphqlOrder(by: string, type: string) {
    return `order_by: { ${by}: ${type} }`
  },
  graphqlDataCounter: (data: any) => data.aggregate.count
})

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: App
    },
    {
      path: '/ajax',
      name: 'ajax',
      component: AjaxApp
    },
    {
      path: '/graph',
      name: 'graph',
      component: GraphqlApp
    }
  ]
})

new Vue({
  router,
  apolloProvider,
  render: h => h(MainApp)
}).$mount('#app')
