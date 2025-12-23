import { HttpClient } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { map, Observable, of, tap } from "rxjs";
import { BlogPost } from "../pages/blog-page/interfaces/blog-post.interface";

@Injectable({
    providedIn: "root"
})
export class BlogService {
    private readonly platformId = inject(PLATFORM_ID);
    // isPlatformBrowser(this.platformId)

    private readonly httpClient: HttpClient = inject(HttpClient);
    private cachedPosts: BlogPost[] | null = null;

    public getPosts$(): Observable<BlogPost[]> {
        if (this.cachedPosts) {
            return of(this.cachedPosts);
        }
        return this.httpClient.get<BlogPost[]>('/assets/data/blog-posts.json')
            .pipe(
                map(posts => posts.filter(post => new Date(post.dateISO) < new Date())), 
                tap(posts => this.cachedPosts = posts)
            );
    }

    public getPostById(id: string): Observable<BlogPost | undefined> {
        return this.getPosts$().pipe(
            map(posts => posts.find(post => post.id === id))
        );
    }
}
