export default interface ColumnOption {
  field: string;
  type?: string;
  label?: string;
  filter?: boolean;
  order?: boolean;
  hidden?: boolean;
  width?: number;
  format?: Function;
  class?: string;
}
