import ADataProvider, { IDataProvider } from './abstract'
import GridOption from '../interfaces/grid-option'
import Order from '../interfaces/order'
import DataResponse from '../interfaces/data-response'

export default class AjaxDataProvider extends ADataProvider {
  protected resource: string;

  constructor(resource: string, options: GridOption) {
    super(options)
    this.resource = resource
  }

  getData(page: number, limit?: number, searchKeyword?: string, filter?: object, order?: Order): Promise<DataResponse> {
    let currPage = page

    if (this.options.getPageIndex) {
      currPage = this.options.getPageIndex(page)
    }

    const params: any = {}
    if (this.options.pageKey) {
      params[this.options.pageKey] = currPage
    }
    if (this.options.perPageKey) {
      params[this.options.perPageKey] = limit
    }

    if (this.options.orderable && order) {
      if (this.options.sortKey && order.by) {
        params[this.options.sortKey] = order.by

        if (this.options.sortTypeKey && order.type) {
          params[this.options.sortTypeKey] = order.type
        }
      }
    }

    if (this.options.searchable && this.options.searchField && searchKeyword) {
      params[this.options.searchField] = searchKeyword
    }

    if (!this.options.fetchData) {
      return Promise.reject(new Error('no fetch data option'))
    }

    return this.options.fetchData(this.resource, { params })
      .then((data: any): DataResponse => {
        let items: any = []
        let total = 0

        if (this.options.extractData) {
          const res = this.options.extractData(data)
          items = res.items
          total = res.total
        }

        return {
          items,
          total,
          query: params
        }
      })
  }
}
