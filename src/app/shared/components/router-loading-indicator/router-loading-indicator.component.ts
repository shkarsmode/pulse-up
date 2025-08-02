import { Component, DestroyRef, HostBinding, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  Router,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
} from "@angular/router";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { tap } from "rxjs";
import { LogoComponent } from "./logo/logo.component";

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

  @HostBinding("@fade") get fadeAnimation() {
    return this.isLoading ? "visible" : "hidden";
  }
  @HostBinding("style.pointerEvents") pointerEvents = "auto";
  @HostBinding("style.visibility") visibility = "visible";
  @HostBinding("style.zIndex") zIndex = "110";

  public isLoading = false;

  ngOnInit() {
    this.router.events
      .pipe(
        tap((event) => {
          if (event instanceof NavigationStart) {
            this.setIsLoading(true);
          } else if (
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
          ) {
            this.setIsLoading(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
    if (isLoading) {
      this.pointerEvents = "auto";
      this.visibility = "visible";
      this.zIndex = "110";
    } else {
      setTimeout(() => {
        this.pointerEvents = "none";
        this.visibility = "hidden";
        this.zIndex = "-1";
      }, 150);
    }
  }
}
