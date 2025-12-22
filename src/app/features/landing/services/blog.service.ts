import { HttpClient } from "@angular/common/http";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { Observable } from "rxjs";
import { BlogPost } from "../pages/blog-page/interfaces/blog-post.interface";

@Injectable({
    providedIn: "root"
})
export class BlogService {
    private readonly platformId = inject(PLATFORM_ID);
    // isPlatformBrowser(this.platformId)

    private readonly httpClient: HttpClient = inject(HttpClient);

    public getPosts$(): Observable<BlogPost[]> {
        return this.httpClient.get<BlogPost[]>('/assets/data/blog-posts.json');
    }
}
