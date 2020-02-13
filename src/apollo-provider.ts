import Vue from 'vue'
import VueApollo from 'vue-apollo'
import ApolloClient from 'apollo-boost/lib/index'

Vue.use(VueApollo)

const apolloClient = new ApolloClient({
  // You should use an absolute URL here
  // uri: 'https://api.graphcms.com/simple/v1/awesomeTalksClone'
  uri: 'http://localhost:3102/v1/graphql'
})

const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})

export default apolloProvider
