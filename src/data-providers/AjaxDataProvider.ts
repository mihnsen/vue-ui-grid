import ADataProvider from './abstract'
import type GridOption from '../interfaces/grid-option'
import type Order from '../interfaces/order'
import type DataResponse from '../interfaces/data-response'

export default class AjaxDataProvider extends ADataProvider {
  protected resource: string;
  protected cancelRequest: any;

  constructor(resource: string, options: GridOption) {
    super(options)
    this.resource = resource
    this.cancelRequest = null
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

    if (filter) {
      const where: any = { ...filter }
      const filtered: any = Object.keys(where).forEach((key) => {
        params[key] = where[key]
      })
    }

    if (!this.options.fetchData) {
      return Promise.reject(new Error('no fetch data option'))
    }

    let cancelToken = null

    if (this.options.cancelToken) {
      // Check if there are any previous pending requests
      if (this.cancelRequest) {
        this.cancelRequest('Operation canceled due to new request.')
      }

      const CancelToken = this.options.cancelToken
      cancelToken = new CancelToken((executor: any) => {
        this.cancelRequest = executor
      })
    }

    return this.options.fetchData(this.resource, {
      params,
      cancelToken
    })
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
      .finally(() => {
        this.cancelRequest = null
      })
  }
}
