export interface DataResponse {
  query?: object | string;
  items: Array<object>;
  total?: number;
  meta?: number;
}

export interface ErrorResponse extends Error {
  query?: object | string;
  error: object;
}


export default DataResponse
