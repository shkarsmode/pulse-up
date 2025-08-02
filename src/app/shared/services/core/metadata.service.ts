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
    public setMetaTag(name: string, content: string): void {
        this.meta.updateTag({ name, content });
    }

    public listenToRouteChanges(router: Router, activatedRoute: ActivatedRoute): void {
        if(!this.defaultTitle) this.defaultTitle = this.getTitle(); 
        if(!this.defaultDescription) this.defaultDescription = this.getMetaTag("description") || "";

        router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            let currentRoute = activatedRoute;
            while (currentRoute.firstChild) {
                currentRoute = currentRoute.firstChild;
            }

            const data = currentRoute.snapshot.data;
            this.setTitle(data["title"] || this.defaultTitle);
            this.setMetaTag("description", data["description"] || this.defaultDescription);
        });
    }
}
