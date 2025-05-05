import ADataProvider from './abstract'
import type GridOption from '../interfaces/grid-option'
import type ColumnOption from '../interfaces/column-option'
import type Order from '../interfaces/order'
import type { DataResponse, ErrorResponse } from '../interfaces/data-response'
import gql from 'graphql-tag'

export default class RelayDataProvider extends ADataProvider {
  protected relayClient: any;
  protected resource: string;
  protected resourceConnection: string;

  constructor(apollo: any, resource: string, options: GridOption) {
    super(options)
    this.relayClient = apollo
    this.resource = resource
    this.resourceConnection = `${this.resource}_connection`;
  }

  /**
   * Inherit from parent
   * Search keyword is not using
   */
  getData(page: string, limit: number, searchKeyword?: string, filter?: object, order?: Order): Promise<DataResponse> {
    return new Promise((resolve, reject) => {
      const query = this.getQuery(page, limit, filter, order)
      const variables = {
        limit: limit
      }
      const relayQuery = gql`${query}`

      this.relayClient.query({
        fetchPolicy: 'no-cache',
        query: relayQuery,
        variables
      })
        .then((result: any) => {
          if (!result.loading) {
            if (result.error) {
              const err: ErrorResponse = {
                name: 'relay query from vue-ui-grid',
                query,
                error: result.error,
                message: result.error
              }

              return reject(err)
            }

            const data: any = result.data
            const rData = data[`${this.resourceConnection}`]
            if (data) {
              const total = 0
              let prevCursor: string|null = null
              let nextCursor: string|null = null

              if (rData.pageInfo.hasPreviousPage) {
                prevCursor = btoa(`before: "${rData.pageInfo.startCursor}"`)
              }

              if (rData.pageInfo.hasNextPage) {
                nextCursor = btoa(`after: "${rData.pageInfo.endCursor}"`)
              }

              const meta = {
                prev_cursor: prevCursor,
                next_cursor: nextCursor
              }

              const nodes = rData.edges
                .map((edge: any) => edge.node)
                .map((item: any) => this.decodeObject(item))

              const res: DataResponse = {
                query,
                items: nodes,
                total,
                meta
              }
              resolve(res)
            }
          }
        })
    })
  }

  /**
   * Decode id back to integer or uuid
   * @see: https://hasura.io/docs/2.0/schema/postgres/relay-schema/
   */
  decodeObject(node: any): any {
    const decoded = Object.keys(node).reduce((acc: any, curr: string) => {
      let currValue = node[curr]
      if (typeof node[curr] === 'object' && node[curr] && !(node[curr] instanceof Array)) {
        currValue = this.decodeObject(node[curr])
      }

      return {
        ...acc,
        [curr]: currValue
      }
    }, {});

    return {
      ...decoded,
      id: this.decodeId(node.id)
    }
  }

  decodeId(nodeId: string): any {
    try {
      const schemaData = atob(nodeId)
      const schemaId = JSON.parse(schemaData)
      return schemaId[3]
    } catch (e) {
      return nodeId
    }
  }

  getRelayColumn() {
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
      // Filter empty keys
      const where: any = Object.keys(filter).reduce((acc, curr) => {
        if (curr && filter[curr]) {
          acc[curr] = filter[curr]
        }

        return acc;
      }, {});
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
    if (this.options.relayOrder && order && order.by) {
      return this.options.relayOrder(order.by, order.type)
    }

    return ''
  }

  getQuery(page: string, limit: number, filter?: object, order?: Order) {
    const orderQuery = this.getOrderQuery(order)
    const searchQuery = this.getSearchQuery(filter)
    const relayColumn = this.getRelayColumn()

    // Reconvert
    let cursor = ''
    let paginationExp = 'first'
    if (page) {
      try {
        // cursor format should be:
        // before: "eyJpZCIgOiAxNTIzfQ=="
        // after: "eyJpZCIgOiAxNTIzfQ=="
        cursor = atob(page)

        // check https://hasura.io/docs/2.0/api-reference/relay-graphql-api/query/
        if (/before/.test(cursor)) {
          paginationExp = 'last'
        } else {
          paginationExp = 'first'
        }
      } catch (e) {
        cursor = ''
      }
    }

    const query = `
      query getData($limit: Int!) {
        ${this.resourceConnection} (
          ${cursor},
          ${paginationExp}: $limit,
          ${this.options.filterKey}: {
            ${this.options.refFilter}
            ${searchQuery}
          }
          ${orderQuery}
        ) {
          edges {
            cursor
            node {
              ${relayColumn}
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
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
    if (this.options.relayFilter && column && value) {
      return this.options.relayFilter(column.field, column.field_type, value, column.filter_type)
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
          if (this.options.relayFilter && column && filter.value) {
            filterValue = this.options.relayFilter(curr, column.field_type, filter.value, column.filter_type)
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
