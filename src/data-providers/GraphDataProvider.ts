import ADataProvider, { IDataProvider } from './abstract'
import GridOption from '../interfaces/grid-option'
import Order from '../interfaces/order'
import DataResponse, { ErrorResponse } from '../interfaces/data-response'
import gql from 'graphql-tag'

export default class GraphDataProvider extends ADataProvider {
  protected apolloProvider: any;
  protected resource: string;

  constructor(apollo: any, resource: string, options: GridOption) {
    super(options)
    this.apolloProvider = apollo
    this.resource = resource
  }

  /**
   * Inherit from parent
   * Search keyword is not using
   */
  getData(page: number, limit: number, searchKeyword?: string, filter?: object, order?: Order): Promise<Response> {
    return new Promise((resolve, reject) => {
      const query = this.getQuery(page, limit, filter, order)
      const variables = {
        offset: limit * page,
        limit: limit
      }
      const graphqlQuery = gql`${query}`

      this.apolloProvider.query({
        query: graphqlQuery,
        variables
      })
        .then((result) => {
          if (!result.loading) {
            if (result.error) {
              const err: ErrorResponse = {
                query,
                error: result.error
              }

              return reject(err)
            }

            const data: any = result.data
            if (data && data[this.resource]) {
              const res: DataResponse = {
                query,
                items: data[this.resource],
                total: this.options.graphqlDataCounter(data[this.options.resourceMeta])
              }
              resolve(res)
            }
          }
        })
    })
  }

  getGraphColumn() {
    const cols = this.options.columns.filter(
      col => !['custom', 'query'].includes(col.type)
    )
    const queryCols = this.options.columns.filter(col => (col.type === 'query'))

    const normalCol = cols
      .filter(col => !col.field.match(/\./))
      .map(col => col.field).join('\n')

    const ref: any = {}

    let s = normalCol
    Object.keys(ref).forEach((key) => {
      const refQuery = `
        ${key} {
          ${ref[key].join('\n')}
        }
      `
      s = `${s} ${refQuery}`
    })

    return s
  }

  getSearchQuery(filter?: object) {
    let search: Array<string> = []
    if (filter) {
      const where = { ...filter }

      search = Object.keys(where).map((key) => {
        const filter = this.getFilter(key, where[key])
        return where[key]
          ? `${filter}`
          : ''
      }).filter(s => s)

      const normalSearch = Object.keys(where)
        .filter(key => !key.match(/\./))
        .map((key) => {
          const filter = this.getFilter(key, where[key])
          return where[key]
            ? `${filter}`
            : ''
        })
        .filter(s => s)

      search = normalSearch
    }

    return search.join('\n')
  }

  getOrderQuery(order?: Order) {
    if (this.options.graphqlOrder && order.by) {
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
        ${this.resource} (
          ${this.options.offsetKey}: $offset,
          ${this.options.limitKey}: $limit,
          ${this.options.filterKey}: {
            ${this.options.extraFilter}
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

  getFilter(refKey: string, receivedValue: string): string {
    const value = receivedValue.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    const column = this.options.columns.find(c => c.field === refKey)
    if (this.options.graphqlFilter) {
      return this.options.graphqlFilter(column, value)
    }

    return ''
  }
}
