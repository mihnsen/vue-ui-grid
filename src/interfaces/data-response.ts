export default interface DataResponse {
  query?: object;
  items: Array<object>;
  total: number;
}

export interface ErrorResponse extends Error {
  query?: object;
  error: object;
}
