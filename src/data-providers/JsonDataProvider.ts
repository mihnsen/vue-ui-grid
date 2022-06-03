import type GridOption from '../interfaces/grid-option'
import type Order from '../interfaces/order'
import type DataResponse from '../interfaces/data-response'

import ADataProvider from './abstract'

export default class JsonDataProvider extends ADataProvider {
  protected data: Array<object>

  constructor(data: Array<object>, options: GridOption) {
    super(options)
    this.data = data
  }

  updateData(data: Array<object>) {
    this.data = data
  }

  getData(page: number, limit: number, searchKeyword?: string, filter?: object, order?: Order): Promise<DataResponse> {
    return new Promise((resolve) => {
      let data = [...this.data]
      data = this.getSearchedData(data, searchKeyword)
      data = this.getFilteredData(data, filter)
      data = this.getSortedData(data, order)

      const total = data.length
      let items: Array<object> = data

      if (this.options.pagination && data.length > limit) {
        items = data.slice(
          limit * page,
          limit * (page + 1)
        )
      }

      const res: DataResponse = {
        items: items,
        total: total,
        query: {
          page,
          limit,
          searchKeyword,
          filter,
          order
        }
      }

      resolve(res)
    })
  }

  getSearchedData(data: Array<object>, searchKeyword?: string): Array<object> {
    let searched = data.filter((r) => r)

    if (searchKeyword) {
      const re = new RegExp(searchKeyword, 'gi')

      searched = searched.filter((d: any) => {
        let matched = false

        this.options.columns.forEach((c: any) => {
          if (re.test(`${d[c.field]}`)) {
            matched = true
          }
        })

        return matched
      })
    }

    return searched
  }

  getFilteredData(data: Array<object>, filter?: any) {
    let filtered = data

    if (filter) {
      Object.keys(filter).map((key: string) => {
        const re = new RegExp(filter[key], 'gi')

        filtered = filtered.filter((d: any) => re.test(d[key]))
      })
    }

    return filtered
  }

  getSortedData(data: Array<object>, order?: Order) {
    let sortedData = data

    if (order) {
      const column = this.options.columns.find((c) => c.field === order.by)
      if (column) {
        sortedData = sortedData.sort((a: any, b: any) => {
          let field = b[column.field]
          let compareField = a[column.field]

          if (order.type === 'desc') {
            field = a[column.field]
            compareField = b[column.field]
          }

          if (column.type === 'number') {
            return field - compareField
          }

          if (typeof field === 'string') {
            return field.localeCompare(compareField)
          }

          return 0
        })
      }
    }

    return sortedData
  }
}
