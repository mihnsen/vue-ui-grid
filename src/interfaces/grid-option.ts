import DataResponse from './data-response';
import ColumnOption from './column-option'

export default interface GridOption {
  debug?: boolean;
  searchable?: boolean;
  orderable?: boolean;
  filterable?: boolean;
  columnFilterable?: boolean;
  columnVisible?: boolean;
  statusable?: boolean;
  pagination?: boolean;
  exportable?: boolean;

  perPage?: number;
  pageSizes?: Array<number>;
  columns: Array<ColumnOption>;

  perPageKey?: string; // Ajax & Graphql
  pageKey?: string; // Ajax & Graphql
  searchField?: string;
  limit?: number;
  sortKey?: string;
  sortTypeKey?: string;
  getPageIndex?: (page: number) => number;
  extractData?: (responseData: any) => DataResponse;
  fetchData?: (resource: string, options: any) => any;
  cancelToken?: any;

  filterKey?: string;
  offsetKey?: string;
  limitKey?: string;
  resourceMeta?: string;
  refFilter?: string;
  graphqlFilter?: (field: string, fieldType: string | any, value: any, filterType: string | any) => string;
  graphqlOrder?: (by: string, type: string) => string;
  aggregateQuery?: string;
  graphqlDataCounter?: (data) => number;

  routerKey?: any,
}

