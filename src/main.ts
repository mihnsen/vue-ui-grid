import Vue from 'vue'
import App from './App.vue'
import TestVue from './TestVue.vue'
import GraphqlApp from './GraphqlApp.vue'
import apolloProvider from './apollo-provider'
import VueUIGrid from './vue-grid'

Vue.config.productionTip = false

Vue.use(VueUIGrid, {
  graphql: true,
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
  render: h => h(GraphqlApp)
}).$mount('#app')
