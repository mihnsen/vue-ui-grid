import Vue from 'vue'
import VueApollo from 'vue-apollo'
import ApolloClient from 'apollo-boost'

Vue.use(VueApollo)

const apolloClient = new ApolloClient({
  // You should use an absolute URL here
  uri: 'https://api.graphcms.com/simple/v1/awesomeTalksClone'
})

const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})

export default apolloProvider
