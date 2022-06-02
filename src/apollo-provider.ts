// import Vue from 'vue'
// import VueApollo from 'vue-apollo'
// import { ApolloClient, HttpLink, ApolloLink, InMemoryCache } from 'apollo-boost'
//
// const httpLink = new HttpLink({
//   uri: 'http://localhost:3102/v1/graphql'
// })
//
// const authLink = new ApolloLink((operation, forward) => {
//   operation.setContext({
//     headers: {
//       'x-hasura-admin-secret': import.meta.env.VITE_GRAPHQL_SECRET
//     }
//   })
//
//   // Call the next link in the middleware chain.
//   return forward(operation)
// })
//
// Vue.use(VueApollo)
//
// const apolloClient = new ApolloClient({
//   cache: new InMemoryCache(),
//   link: ApolloLink.from([
//     authLink,
//     httpLink // Http link must be at the end of this array: https://stackoverflow.com/a/58736777
//   ])
// })
//
// const apolloProvider = new VueApollo({
//   defaultClient: apolloClient
// })
//
// export default apolloProvider
//
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:3102/v1/graphql',
  headers: {
    'x-hasura-admin-secret': import.meta.env.VITE_GRAPHQL_SECRET
  },
})

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})

export default apolloClient
