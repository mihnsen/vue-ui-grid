export default interface ColumnOption {
  type?: string;
  field: string;
  field_type?: string;
  label?: string;
  filter?: boolean;
  filter_type?: string;
  filter_value?: any;
  order?: boolean;
  hidden?: boolean;
  width?: number;
  format?: Function;
  class?: string;
}
