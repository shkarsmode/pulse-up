import { inject, Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class MetadataService {
    private readonly title: Title = inject(Title);
    private readonly meta: Meta = inject(Meta);
    private defaultTitle = "";
    private defaultDescription = "";

    private getTitle(): string {
        return this.title.getTitle();
    }
    private getMetaTag(name: string) {
        return this.meta.getTag(`name='${name}'`)?.content;
    }

    public setTitle(content: string): void {
        this.title.setTitle(content);
    }
    public setMetaTags(config: { 
        title?: string; 
        description?: string; 
        image?: string;
    }): void {
        const title = config.title || this.defaultTitle;
        const description = config.description || this.defaultDescription;
    
        this.title.setTitle(title);
    
        this.meta.updateTag({ name: "description", content: description });
    
        this.meta.updateTag({ property: "og:title", content: title });
        this.meta.updateTag({ property: "og:description", content: description });
    
        if (config.image) {
            this.meta.updateTag({ property: "og:image", content: config.image });
        }
    
        this.meta.updateTag({ name: "twitter:title", content: title });
        this.meta.updateTag({ name: "twitter:description", content: description });
    }

    public listenToRouteChanges(router: Router, activatedRoute: ActivatedRoute): void {
        if (!this.defaultTitle) this.defaultTitle = this.getTitle(); 
        if (!this.defaultDescription) this.defaultDescription = 
            this.getMetaTag("description") || "";

        router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                let currentRoute = activatedRoute;

                while (currentRoute.firstChild) {
                    currentRoute = currentRoute.firstChild;
                }

                const data = currentRoute.snapshot.data;
                this.setMetaTags({
                    title: data["title"],
                    description: data["description"],
                    image: data["ogImage"],
                });

                console.log(data);
            });
    }
}
