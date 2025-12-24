import { BlogService } from '@/app/features/landing/services/blog.service';
import { LandingPageLayoutComponent } from '@/app/features/landing/ui/landing-page-layout/landing-page-layout.component';
import { environment } from '@/environments/environment';
import { DatePipe, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    SecurityContext,
    ViewEncapsulation,
    WritableSignal,
    computed,
    inject,
    signal,
} from '@angular/core';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { first, map, tap } from 'rxjs';
import { BlogPost } from '../../interfaces/blog-post.interface';

@Component({
    selector: 'app-post',
    standalone: true,
    imports: [LandingPageLayoutComponent, NgIf, DatePipe],
    templateUrl: './post.component.html',
    styleUrl: './post.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class PostComponent implements OnInit {
    private readonly blogService = inject(BlogService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly sanitizer = inject(DomSanitizer);
    private readonly titleService = inject(Title);
    private readonly metaService = inject(Meta);

    public readonly post: WritableSignal<BlogPost | undefined> = signal(undefined);

    public readonly safeContentHtml = computed<SafeHtml>(() => {
        const post = this.post();
        const rawHtml = post?.contentHtml ?? '';
        const sanitizedHtml = this.sanitizer.sanitize(SecurityContext.HTML, rawHtml) ?? '';
        return this.sanitizer.bypassSecurityTrustHtml(sanitizedHtml);
    });

    public readonly isReady = computed<boolean>(() => Boolean(this.post()));

    public ngOnInit(): void {
        this.route.paramMap
            .pipe(
                map((params: ParamMap) => params.get('id') ?? ''),
                first()
            )
            .subscribe((id) => {
                if (!id) {
                    this.router.navigate(['/not-found']);
                    return;
                }

                this.blogService
                    .getPostById(id)
                    .pipe(
                        first(),
                        tap((post) => {
                            if (!post) {
                                this.router.navigate(['/not-found']);
                                return;
                            }

                            this.applyMeta(post);
                        })
                    )
                    .subscribe((post) => this.post.set(post));
            });
    }

    public goBack(): void {
        this.router.navigate(['/blog']);
    }

    public share(): void {
        const urlToShare = window.location.href;

        if (navigator.share) {
            void navigator.share({
                title: this.post()?.title ?? 'PulseUp Insights',
                text: this.post()?.excerpt ?? '',
                url: urlToShare,
            });
            return;
        }

        void navigator.clipboard.writeText(urlToShare);
    }

    private applyMeta(post: BlogPost): void {
        const pageTitle = `${post.title} | PulseUp Insights`;
        const description = post.excerpt ?? post.subtitle ?? '';
        const imageUrl = this.toAbsoluteUrl(post.coverImageUrl);

        this.titleService.setTitle(pageTitle);

        this.metaService.updateTag({ name: 'description', content: description });

        this.metaService.updateTag({ property: 'og:title', content: pageTitle });
        this.metaService.updateTag({ property: 'og:description', content: description });
        this.metaService.updateTag({ property: 'og:type', content: 'article' });
        this.metaService.updateTag({ property: 'og:image', content: imageUrl });

        this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.metaService.updateTag({ name: 'twitter:title', content: pageTitle });
        this.metaService.updateTag({ name: 'twitter:description', content: description });
        this.metaService.updateTag({ name: 'twitter:image', content: imageUrl });
    }

    private toAbsoluteUrl(url: string): string {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        const normalized = url.startsWith('/') ? url : `/${url}`;
        return `${environment.production ? 'https://pulseup.com' : 'https://pulse-up.vercel.app'}${normalized}`;
    }
}
