import axios from 'axios'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { useRouter, routerKey } from 'vue-router'

import VueGrid from './vue-grid'

// import TestVue from './TestVue.vue'

import MainApp from './MainApp.vue'
import AjaxApp from './AjaxApp.vue'
import GraphqlApp from './GraphqlApp.vue'
import RelayApp from './RelayApp.vue'
import App from './App.vue'

// Graph
import apolloClient, { relayClient } from './apollo-provider'

// Ajax
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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
    },
    {
      path: '/relay',
      name: 'relay',
      component: RelayApp
    }
  ]
});

const app = createApp(MainApp)
app.use(router)
app.provide(DefaultApolloClient, apolloClient)
app.provide('$vgridApolloClient', apolloClient)
app.provide('$vgridRelayClient', relayClient)
app.use(VueGrid, {
  debug: true,
  ajax: true,
  fetchData: axios.get,
  cancelToken: axios.CancelToken,
  pageKey: 'page',
  cursorKey: 'cursor',
  perPageKey: 'per_page',
  extractData: (responseData: any) => {
    const data = responseData.data
    let meta: any = null

    const links: any = {
      first: null,
      last: null,
      next: 'http://localhost:3101/api/orders?cursor=aaa',
      prev: null
    }

    if (links) {
      const reg = /cursor=(.*)&?/
      const prevMatch = links.prev ? links.prev.match(reg) : null
      const nextMatch = links.next ? links.next.match(reg) : null

      meta = {
        prev_cursor: prevMatch ? prevMatch[1] : null,
        next_cursor: nextMatch ? nextMatch[1] : null
      }
    }

    return {
      items: data.data,
      total: data.total,
      meta: meta
    }
  },
  getPageIndex: (index: number) => (index + 1),

  useRouter,
  routerKey,

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
  graphqlDataCounter: (data: any) => data.aggregate.count,

  // Relay
  relay: true,
  relayFilter(field: string, fieldType: string, value: any, filterType: string) {
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
  relayOrder(by: string, type: string) {
    return `order_by: { ${by}: ${type} }`
  },
})

app.mount('#app');
