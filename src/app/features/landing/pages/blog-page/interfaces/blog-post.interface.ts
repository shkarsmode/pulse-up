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
    subtitle: string;
    category: string;
    dateISO: string;
    readMinutes: number;
    coverImageUrl: string;
    coverImageAlt: string;
    contentHtml: string;
    tags: string[];
}
