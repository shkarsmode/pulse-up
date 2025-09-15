import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HeaderComponent } from "@/app/shared/components/header/header.component";
import { FooterComponent } from "@/app/shared/components/footer/footer.component";

@Component({
    selector: "app-user",
    template: `
        <app-header />

        <div class="user-page">
            <router-outlet></router-outlet>
        </div>

        @if (isToShowFooter) {
            <app-footer />
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            background-color: var(--white-color);
        }
        .user-page {
            flex: 1 1 auto;
            padding: 0 20px 30px 20px;
        }

        @media screen and (max-width: 650px) {
            .user-page {
                padding: 24px 20px;
            }
        }
    `,
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, FooterComponent],
})
export class UserComponent implements OnInit {
    public isToShowFooter = true;
    private readonly destroyed = inject(DestroyRef);
    private readonly route = inject(ActivatedRoute);

    public ngOnInit(): void {
        this.initRouteListenerToChangeFooterVisibility();
    }

    private initRouteListenerToChangeFooterVisibility(): void {
        this.route.data.pipe(takeUntilDestroyed(this.destroyed)).subscribe(() => {
            this.isToShowFooter = true;
            if (window.location.pathname.includes("/user/topic")) this.isToShowFooter = false;
        });
    }
}
