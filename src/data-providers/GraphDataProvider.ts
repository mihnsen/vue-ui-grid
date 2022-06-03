import ADataProvider, { IDataProvider } from './abstract'
import GridOption from '../interfaces/grid-option'
import ColumnOption from '../interfaces/column-option'
import Order from '../interfaces/order'
import DataResponse, { ErrorResponse } from '../interfaces/data-response'
import gql from 'graphql-tag'

export default class GraphDataProvider extends ADataProvider {
  protected apolloClient: any;
  protected resource: string;

  constructor(apollo: any, resource: string, options: GridOption) {
    super(options)
    this.apolloClient = apollo
    this.resource = resource
  }

  /**
   * Inherit from parent
   * Search keyword is not using
   */
  getData(page: number, limit: number, searchKeyword?: string, filter?: object, order?: Order): Promise<DataResponse> {
    return new Promise((resolve, reject) => {
      const query = this.getQuery(page, limit, filter, order)
      const variables = {
        offset: limit * page,
        limit: limit
      }
      const graphqlQuery = gql`${query}`

      this.apolloClient.query({
        fetchPolicy: 'no-cache',
        query: graphqlQuery,
        variables
      })
        .then((result: any) => {
          if (!result.loading) {
            if (result.error) {
              const err: ErrorResponse = {
                name: 'graphql query from vue-ui-grid',
                query,
                error: result.error,
                message: result.error
              }

              return reject(err)
            }

            const data: any = result.data
            if (data && data[this.resource]) {
              let total = data[this.resource].length
              if (this.options.graphqlDataCounter && this.options.resourceMeta) {
                total = this.options.graphqlDataCounter(data[this.options.resourceMeta])
              }

              const res: DataResponse = {
                query,
                items: data[this.resource],
                total
              }
              resolve(res)
            }
          }
        })
    })
  }

  getGraphColumn() {
    const cols = this.options.columns.filter(
      (col: any) => !['custom', 'query'].includes(col.type)
    )

    const normalCols = cols.filter(col => !col.field.match(/\./))
    const refColumn = cols.filter(col => col.field.match(/\./))

    const normalQuery = normalCols.filter(col => !col.field.match(/\./))
      .map(col => col.field).join('\n')

    const refQuery = this.getRefQuery(refColumn)

    return `
    ${normalQuery}
    ${refQuery}
    `
  }

  getSearchQuery(filter?: object) {
    let search: Array<string> = []
    if (filter) {
      const where: any = { ...filter }
      const normalKeys = Object.keys(where).filter(key => !key.match(/\./))
      const refKeys = Object.keys(where).filter(key => key.match(/\./))

      const normalSearch = normalKeys.map((key) => {
        const cfilter = this.getFilter(key, where[key])
        return where[key]
          ? `${cfilter}`
          : ''
      })
        .filter(s => s)
        .join('')

      const refFilters = refKeys.map((key) => {
        return {
          key,
          value: where[key]
        }
      })
      const refSearch = this.getRefFilter(refFilters)

      search = [
        normalSearch,
        refSearch
      ]
    }

    return search.join('\n')
  }

  getOrderQuery(order?: Order) {
    if (this.options.graphqlOrder && order && order.by) {
      return this.options.graphqlOrder(order.by, order.type)
    }

    return ''
  }

  getQuery(page: number, limit: number, filter?: object, order?: Order) {
    const orderQuery = this.getOrderQuery(order)
    const searchQuery = this.getSearchQuery(filter)
    const graphColumn = this.getGraphColumn()

    const query = `
      query getData($offset: Int!, $limit: Int!) {
        ${this.resource}_aggregate (
          ${this.options.filterKey}: {
            ${this.options.refFilter}
            ${searchQuery}
          }
          ${orderQuery}
        ) {
          ${this.options.aggregateQuery}
        }
        ${this.resource} (
          ${this.options.offsetKey}: $offset,
          ${this.options.limitKey}: $limit,
          ${this.options.filterKey}: {
            ${this.options.refFilter}
            ${searchQuery}
          }
          ${orderQuery}
        ) {
          ${graphColumn}
        }
      }
    `

    return query
  }

  getFilter(columnKey: string, receivedValue: any): string {
    let value = receivedValue
    if (typeof receivedValue === 'string') {
      value = receivedValue.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    }

    const column = this.options.columns.find(c => c.field === columnKey)
    if (this.options.graphqlFilter && column && value) {
      return this.options.graphqlFilter(column.field, column.field_type, value, column.filter_type)
    }

    return ''
  }

  getRefQuery(columns: ColumnOption[]) {
    const fields = columns.map(c => c.field)
      .map(field => field.split('.'))

    const tree = {}
    fields.forEach(row => {
      row.reduce((acc: any, curr) => {
        if (!acc[curr]) {
          acc[curr] = {}
        }

        return acc[curr]
      }, tree)
    })

    return this.getRefQueryByNode(tree, true)
  }

  getRefQueryByNode(node: any, isRoot = false): string {
    const keys = Object.keys(node)
    if (keys.length) {
      const q = keys.map(key => {
        return `
          ${key} ${this.getRefQueryByNode(node[key])}
        `
      })
        .join('\n')

      return isRoot ? q : `{ ${q} }`
    }

    return ''
  }

  getRefFilter(filters: any[]): string {
    if (!filters || !filters.length) {
      return ''
    }

    const tree = {}

    filters.forEach(filter => {
      const column = this.options.columns.find(c => c.field === filter.key)
      const fields = filter.key.split('.')
      const len = fields.length

      fields.reduce((acc: any, curr: string, index: number) => {
        let filterValue = {}
        if (index === len - 1) {
          filterValue = filter.value
          if (this.options.graphqlFilter && column && filter.value) {
            filterValue = this.options.graphqlFilter(curr, column.field_type, filter.value, column.filter_type)
          }
        }

        if (!acc[curr]) {
          acc[curr] = filterValue
        }

        return acc[curr]
      }, tree)
    })

    return this.getRefFilterByNode(tree, true)
  }

  getRefFilterByNode(node: any, isRoot = false): string {
    if (typeof node === 'object') {
      const keys = Object.keys(node)

      if (keys.length) {
        const q = keys.map(key => {
          if (typeof node[key] === 'object') {
            return `
              ${key}: ${this.getRefFilterByNode(node[key])}
            `
          }

          return this.getRefFilterByNode(node[key])
        })
          .join('\n')

        return isRoot ? q : `{ ${q} }`
      }
    }

    return node
  }
}
