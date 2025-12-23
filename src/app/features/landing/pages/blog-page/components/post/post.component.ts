import { BlogService } from '@/app/features/landing/services/blog.service';
import { LandingPageLayoutComponent } from '@/app/features/landing/ui/landing-page-layout/landing-page-layout.component';
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { first, map, tap } from 'rxjs';
import { BlogPost } from '../../interfaces/blog-post.interface';

@Component({
    selector: 'app-post',
    standalone: true,
    imports: [LandingPageLayoutComponent, JsonPipe],
    templateUrl: './post.component.html',
    styleUrl: './post.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostComponent implements OnInit {
    private blogService = inject(BlogService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);


    public post: WritableSignal<BlogPost | undefined> = signal(undefined);

    public ngOnInit(): void {
        this.route.paramMap
            .pipe(
                map((params: ParamMap) => {
                    const idParam = params.get("id") || "";
                    return idParam;
                }),
                first()
            )
            .subscribe((id) => {
                if (!id) {
                    this.router.navigate(['/not-found']);
                    return;
                }
                this.blogService.getPostById(id)
                    .pipe(first(), tap(post => !post && this.router.navigate(['/not-found'])))
                    .subscribe((post) => this.post.set(post));
            });
    
    }

}
