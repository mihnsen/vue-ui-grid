import Vue from 'vue'

declare module '*.vue' {
  export default Vue
}

declare interface AjaxGridExtracedData {
  items: Array<any>;
  total: number;
}

declare interface VGrid {
  debug: boolean;
  offsetKey: string;
  filterKey: string;
  limitKey: string;
  aggregateQuery: string;
  graphqlFilter(column: any, value: string): string;
  graphqlOrder(by: string, type: string): string;
  graphqlDataCounter(data: any): number;
  pageKey: string;
  perPageKey: string;
  sortKey: string;
  sortTypeKey: string;
  getPageIndex(index: number): number;
  extractData(data: any): AjaxGridExtracedData;
  fetchData(data: any): any;
}

declare module "vue/types/vue" {
  interface Vue {
    $vgrid: VGrid;
  }
}
