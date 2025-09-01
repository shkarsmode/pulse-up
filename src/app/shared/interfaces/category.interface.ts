export interface ICategory {
    name: string;
    topics: number;
    votes: number;
}

export type IFilterCategory = string | "newest" | "trending";