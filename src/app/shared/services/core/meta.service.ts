import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root',
})
export class MetaService {
    private readonly title: Title = inject(Title);
    private readonly meta: Meta = inject(Meta);

    setTitle(content: string): void {
        this.title.setTitle(content);
    }
    setMetaTag(name: string, content: string): void {
        this.meta.updateTag({ name, content });
    }
}
