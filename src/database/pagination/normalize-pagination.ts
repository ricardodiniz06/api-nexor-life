const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

export type NormalizedPagination = {
  page: number;
  limit: number;
  skip: number;
};

export function normalizePagination(input: {
  page?: number;
  limit?: number;
}): NormalizedPagination {
  const page = Math.max(Number(input.page) || DEFAULT_PAGE, 1);
  const limit = Math.min(
    Math.max(Number(input.limit) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  return { page, limit, skip: (page - 1) * limit };
}
