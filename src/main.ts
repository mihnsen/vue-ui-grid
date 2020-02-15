import Vue from 'vue'
import App from './App.vue'
import TestVue from './TestVue.vue'
import GraphqlApp from './GraphqlApp.vue'
import AjaxApp from './AjaxApp.vue'
import apolloProvider from './apollo-provider'
import VueUIGrid from './vue-grid'
import axios from 'axios'

Vue.config.productionTip = false

axios.defaults.baseURL = 'https://reqres.in/api'
axios.interceptors.response.use((response) => {
  return response
}, (error) => {
  // Do something with response error
  if (error.response && error.response.status === 401) {
    // TODO logout
  }

  console.log('error', error)
  return Promise.reject(error.response)
})

Vue.use(VueUIGrid, {
  debug: true,
  ajax: true,
  fetchData: axios.get,
  pageKey: 'page',
  perPageKey: 'per_page',
  extractData: (responseData: any) => {
    const data = responseData.data
    // console.log('hello', data)
    return {
      items: data.data,
      total: data.total
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

  graphqlFilter(field: string, fieldType: string, value: string) {
    let result = ''

    if (field) {
      if (fieldType === 'uuid') {
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

new Vue({
  apolloProvider,
  render: h => h(AjaxApp)
}).$mount('#app')
