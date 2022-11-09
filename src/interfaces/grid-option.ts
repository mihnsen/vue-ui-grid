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

  routeState?: boolean;
  cursorPagination?: boolean;

  perPageKey?: string; // Ajax & Graphql
  pageKey?: string; // Ajax & Graphql
  cursorKey?: string; // CursorPagination
  searchField?: string;
  limit: number;
  sortKey?: string;
  sortTypeKey?: string;
  getPageIndex?: Function;
  extractData?: Function;
  fetchData?: Function;
  cancelToken?: any;

  filterKey?: string;
  offsetKey?: string;
  limitKey?: string;
  resourceMeta?: string;
  refFilter?: string;
  graphqlFilter?: Function;
  graphqlOrder?: Function;
  aggregateQuery?: Function;
  graphqlDataCounter?: Function;
}

