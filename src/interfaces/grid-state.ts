export default interface GridState {
  searchKeyword?: string;
  currentPage?: number;
  limit?: number;
  pageSizes?: number[];
  order?: any;
  where?: any;
  gridstate?: number;
  hasSortType?: boolean;
}
