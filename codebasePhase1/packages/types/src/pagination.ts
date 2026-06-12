export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type PaginationMeta = Pick<Pagination, 'page' | 'limit' | 'total'>;

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
