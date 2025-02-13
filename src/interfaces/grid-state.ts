export default interface GridState {
  searchKeyword?: string;
  currentPage?: number | string;
  limit?: number;
  pageSizes?: number[];
  order?: any;
  where?: any;
  time?: number;
  hasSortType?: boolean;
}
