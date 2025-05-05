import type GridOption from '../../interfaces/grid-option'
import type DataResponse from '../../interfaces/data-response'

export interface IDataProvider {
  applySearch(search?: string): IDataProvider;
  applyFilter(filter?: object): IDataProvider;
  applyOrder(order?: object): IDataProvider;
  applyPagination(page: number): IDataProvider;
}

export default class ADataProvider implements IDataProvider {
  protected options: GridOption

  constructor(options: GridOption) {
    this.options = options
  }

  getData(page: string|number, limit?: number, search?: string, filter?: object, order?: object): Promise<DataResponse> {
    return new Promise((resolve, reject) => {
      const response: DataResponse = {
        items: [],
        total: 0
      }
      resolve(response)
    })
  }

  applySearch(search?: string): IDataProvider {
    return this
  }

  applyFilter(filter?: object): IDataProvider {
    return this
  }

  applyOrder(order?: object): IDataProvider {
    return this
  }

  applyPagination(page: number): IDataProvider {
    return this
  }

  setOptions(options: GridOption) {
    this.options = options
  }
}
