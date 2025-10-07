export interface ErrorResponseI {
  status?: number;
  message?: string;
  data?: unknown;
}

export interface PaginationI {
  page: number;
  limit: number;
  skip: number;
}
