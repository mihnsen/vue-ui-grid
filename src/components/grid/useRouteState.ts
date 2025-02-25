import { computed } from 'vue'

export default function(router, props) {
  // Define grid state
  const route = router.currentRoute
  const routeName = route.value.name

  const getStateFromRoute = () => {
    const state: any = {}
    const query: any = route.value.query || {}
    if (query.gridstate) {
      state.gridstate = query.gridstate
    } else {
      state.gridstate = new Date().getTime()
    }
    if (props.searchField && query[props.searchField]) {
      state.searchKeyword = query[props.searchField]
    }

    if (props.cursorPagination) {
      if (query.cursor) {
        state.currentPage = query.cursor
      }
    } else {
      if (query.page) {
        state.currentPage = parseInt(query.page, 10)
      }
    }

    if (query.limit) {
      state.limit = parseInt(query.limit, 10)
    }
    if (query.order) {
      state.order = {
        by: query.order,
        type: query.order_type || 'desc',
      }
    }
    const filter: any = {}
    Object.keys(query).forEach((key) => {
      const column = props.columns.find((c) => c.field === key)
      if (column && (column.filter || column.field === props.searchField)) {
        filter[key] = query[key]
      }
    })
    state.where = filter

    return state
  }

  const updateRouteIfNeeded = (params) => {
    // Check if still in current route
    const { currentRoute } = router
    if (currentRoute.value.name !== routeName) {
      return;
    }

    const newQuery = {
      ...route.value.query,
      ...params,
    }

    router.replace({ query: newQuery })
  }

  const routeGridParams = getStateFromRoute();
  const queryGridState = computed(() => {
    const { currentRoute } = router
    const { query } = currentRoute.value
    if (query && query.gridstate) {
      return query.gridstate
    }
    return null
  })

  return {
    queryGridState,
    routeGridParams,
    updateRouteIfNeeded,
  }
}
