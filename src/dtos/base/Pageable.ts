
export type Pageable<T> = {
  totalPages: number;
  totalElements: number;
  pageable: PageableInfo;
  size: number;
  content: T[];
  number: number;
  sort: Sort[];
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};

export type PageableInfo = {
  pageNumber: number;
  pageSize: number;
  offset: number;
  sort: Sort[];
  paged: boolean;
  unpaged: boolean;
};

export type Sort = {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
};
