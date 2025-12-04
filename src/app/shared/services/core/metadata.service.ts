import { inject, Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";

interface IMetadataConfig {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
}

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
    public setMetaTags(config: IMetadataConfig): void {
        const { title, description, image, url } = config;

        console.log(config);
        if (title) {
            this.title.setTitle(title);
            this.updateOgTag("og:title", title);
            this.updateTwitterTag("twitter:title", title);
        }

        if (description) {
            this.meta.updateTag({ name: "description", content: description });
            this.updateOgTag("og:description", description);
            this.updateTwitterTag("twitter:description", description);
        }

        if (image) {
            this.updateOgTag("og:image", image);
            this.updateTwitterTag("twitter:image", image);
        }

        if (url) {
            this.updateOgTag("og:url", url);
        }

        this.updateOgTag("og:type", "website");
        this.updateTwitterTag("twitter:card", "summary_large_image");
    }

    private updateOgTag(property: string, content: string): void {
        this.meta.updateTag({ property, content });
    }

    private updateTwitterTag(name: string, content: string): void {
        this.meta.updateTag({ name, content });
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
