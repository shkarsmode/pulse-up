export type BlogCategory =
    | 'All Posts'
    | 'Impact'
    | 'Authenticity'
    | 'Transparency'
    | 'Privacy'
    | 'Security'
    | 'Engagement'
    | 'Ethics'
    | 'Future'
    | 'Activism'
    | 'Policy'
    | 'Community'
    | 'Personal';

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    category: Exclude<BlogCategory, 'All Posts'>;
    dateISO: string; // YYYY-MM-DD
    readMinutes: number;
    coverImageUrl: string;
    coverImageAlt: string;
    tags: string[];
}
