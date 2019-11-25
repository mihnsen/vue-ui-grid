import Vue from 'vue'

declare module '*.vue' {
  export default Vue
}

declare interface VGraphGrid {
  offsetKey: string;
  filterKey: string;
  limitKey: string;
  graphqlFilter(column: any, value: string): string;
  graphqlOrder(by: string, type: string): string;
  graphqlDataCounter(data: any): number;
}

declare module "vue/types/vue" {
  interface Vue {
    $graphGrid: VGraphGrid;
  }
}
