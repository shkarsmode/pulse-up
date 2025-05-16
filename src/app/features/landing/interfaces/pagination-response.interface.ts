export interface PaginatorResponse<T> {
    items: T[];
    page: number;
    hasMorePages: boolean;
}
