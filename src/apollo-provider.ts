import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { ApolloClient, HttpLink, ApolloLink, InMemoryCache } from 'apollo-boost'

const httpLink = new HttpLink({
  uri: 'http://localhost:3102/v1/graphql'
})

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      'x-hasura-admin-secret': process.env.VUE_APP_GRAPHQL_SECRET
    }
  })

  // Call the next link in the middleware chain.
  return forward(operation)
})

Vue.use(VueApollo)

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    authLink,
    httpLink // Http link must be at the end of this array: https://stackoverflow.com/a/58736777
  ])
})

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  queryDeduplication: false
})

export default apolloProvider
