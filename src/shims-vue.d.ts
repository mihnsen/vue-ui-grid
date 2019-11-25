import Vue from 'vue'

declare module '*.vue' {
  export default Vue
}

declare interface GraphGrid {
  offsetKey: string;
  filterKey: string;
  limitKey: string;
  graphqlFilter(column: any, value: string): string;
  graphqlOrder(by: string, type: string): string;
  graphqlDataCounter(data: any): number;
}

declare interface AjaxGridExtracedData {
  items: Array<any>;
  total: number;
}

declare interface AjaxGrid {
  rootUrl: string;
  pageKey: string;
  perPageKey: string;
  sortKey: string;
  sortTypeKey: string;
  getPageIndex(index: number): number;
  extractData(data: any): AjaxGridExtracedData;
}

declare module "vue/types/vue" {
  interface Vue {
    $graphGrid: GraphGrid;
    $ajaxGrid: AjaxGrid;
  }
}
