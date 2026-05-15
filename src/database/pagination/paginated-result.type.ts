export type PaginatedMeta = {
  page: number;
  limit: number;
  total: number;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: PaginatedMeta;
};
