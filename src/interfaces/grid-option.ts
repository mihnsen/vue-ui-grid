import ColumnOption from './column-option'

export default interface GridOption {
  searchable?: boolean;
  orderable?: boolean;
  filterable?: boolean;
  columnFilterable?: boolean;
  columnVisible?: boolean;
  statusable?: boolean;
  pagination?: boolean;
  exportable?: boolean;

  columns: Array<ColumnOption>;

  perPageKey?: string; // Ajax & Graphql
  pageKey?: string; // Ajax & Graphql

  searchField?: string;
  limit: number;
  sortKey?: string;
  sortTypeKey?: string;
  getPageIndex?: Function;
  extractData?: Function;
  fetchData?: Function;

  filterKey?: string;
  offsetKey?: string;
  limitKey?: string;
  resourceMeta?: string;
  refFilter?: string;
  refQuery?: string;
  graphqlFilter?: Function;
  graphqlOrder?: Function;
  aggregateQuery?: Function;
  graphqlDataCounter?: Function;
}

