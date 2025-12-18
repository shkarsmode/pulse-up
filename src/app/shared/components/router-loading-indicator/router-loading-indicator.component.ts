import { animate, state, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    Router
} from "@angular/router";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map } from "rxjs";
import { LogoComponent } from "./logo/logo.component";
import { RouterLoadingIndicatorService } from "./router-loading-indicator.service";

@Component({
    selector: "app-router-loading-indicator",
    templateUrl: "./router-loading-indicator.component.html",
    styleUrls: ["./router-loading-indicator.component.scss"],
    animations: [
        trigger("fade", [
            state("visible", style({ opacity: 1 })),
            state("hidden", style({ opacity: 0 })),
            transition("visible <=> hidden", [animate("0.15s ease")]),
        ]),
    ],
    standalone: true,
    imports: [CommonModule, LogoComponent],
})
export class RouterLoadingIndicatorComponent implements OnInit {
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    private loadingIndicatorService = inject(RouterLoadingIndicatorService);

    // @HostBinding("@fade") get fadeAnimation() {
    //     return this.isLoading ? "visible" : "hidden";
    // }
    // @HostBinding("style.pointerEvents") pointerEvents = "auto";
    // @HostBinding("style.visibility") visibility = "visible";
    // @HostBinding("style.zIndex") zIndex = "110";

    private isNavigating = new BehaviorSubject<boolean>(true);
    private isLoading = false;

    public isLoading$ = combineLatest([
        this.loadingIndicatorService.loading$,
        this.isNavigating.asObservable(),
    ]).pipe(
        map(([serviceLoading, navigationLoading]) => serviceLoading || navigationLoading),
        distinctUntilChanged(),
    );

    ngOnInit() {
        setTimeout(() => {
            this.isNavigating.next(false);
        }, 1000);
        // this.router.events
        //     .pipe(
        //         tap((event) => {
        //             if (event instanceof NavigationStart) {
        //                 this.isNavigating.next(true);
        //             } else if (
        //                 event instanceof NavigationEnd ||
        //                 event instanceof NavigationCancel ||
        //                 event instanceof NavigationError
        //             ) {
        //                 this.isNavigating.next(false);
        //             }
        //         }),
        //         takeUntilDestroyed(this.destroyRef),
        //     )
        //     .subscribe();

        this.isLoading$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((loading) => this.setIsLoading(loading));
    }

    private setIsLoading(isLoading: boolean) {
        this.isLoading = isLoading;
        // if (isLoading) {
        //     this.pointerEvents = "auto";
        //     this.visibility = "visible";
        //     this.zIndex = "110";
        // } else {
        //     // setTimeout(() => {
        //     //     this.pointerEvents = "none";
        //     //     this.visibility = "hidden";
        //     //     this.zIndex = "-1";
        //     // }, 150); // matches fade animation duration
        // }
    }
}
