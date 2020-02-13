import ColumnOption from './column-option'

export default interface GridOption {
  perPageKey: string;
  searchable?: boolean;
  orderable?: boolean;
  filterable?: boolean;
  columnFilterable?: boolean;
  columnVisible?: boolean;
  statusable?: boolean;
  pagination?: boolean;
  exportable?: boolean;

  columns: Array<ColumnOption>;

  searchField?: string;
  limit: number;
  pageKey: string;
  sortKey?: string;
  sortTypeKey?: string;
  getPageIndex?: Function;
  extractData: Function;
  fetchData: Function;
}

