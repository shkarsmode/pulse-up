import { inject, Injectable, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class MetaService {
    private readonly title: Title = inject(Title);
    private readonly meta: Meta = inject(Meta);
    
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

    public updateMetaTags(route: ActivatedRoute): void {
        const defaultTitle = this.getTitle();
        const defaultDescription = this.getMetaTag('description');
        route.data.subscribe((data) => {
            this.setTitle(data['title'] || defaultTitle);
            this.setMetaTag(
                'description',
                data['description'] || defaultDescription
            );
        });
    }
}
