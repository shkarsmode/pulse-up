export interface IPaginator<T> {
  items: T[];
  page: number;
  hasMorePages: boolean;
}