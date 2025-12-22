import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { LandingPageLayoutComponent } from '../../ui/landing-page-layout/landing-page-layout.component';
import { BlogCategory, BlogPost } from './interfaces/blog-post.interface';

@Component({
    selector: 'app-blog-page',
    standalone: true,
    imports: [LandingPageLayoutComponent, DatePipe],
    templateUrl: './blog-page.component.html',
    styleUrl: './blog-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogPageComponent {
    private readonly blogPostsService: BlogService = inject(BlogService);

    public readonly activeCategory = signal<BlogCategory>('All Posts');

    public readonly categories: BlogCategory[] = [
        'All Posts',
        'Impact',
        'Authenticity',
        'Transparency',
        'Privacy',
        'Security',
        // 'Engagement',
        // 'Ethics',
        // 'Future',
        // 'Activism',
        // 'Policy',
        // 'Community',
        // 'Personal',
    ];

    public readonly posts = signal<BlogPost[]>([]);

    public readonly visiblePosts = computed<BlogPost[]>(() => {
        const category = this.activeCategory();
        const posts = this.posts();

        if (category === 'All Posts') {
            return posts;
        }

        return posts.filter((post) => post.category === category);
    });

    public ngOnInit(): void {
        this.blogPostsService.getPosts$().subscribe((posts) => {
            this.posts.set(posts);
        });
    }

    public setActiveCategory(category: BlogCategory): void {
        this.activeCategory.set(category);
    }

    public trackByPostId(_: number, post: BlogPost): string {
        return post.id;
    }
}
