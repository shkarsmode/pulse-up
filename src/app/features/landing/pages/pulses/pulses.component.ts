import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { SvgIconComponent } from "angular-svg-icon";
import { first, map, Observable } from "rxjs";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { IPaginator, ITopic } from "@/app/shared/interfaces";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { InputSearchComponent } from "../../ui/input-search/input-search.component";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { PromoteAdsComponent } from "../../ui/promote-ads/promote-ads.component";
import { InfiniteLoaderService } from "../../services/infinite-loader.service";
import { AppConstants } from "@/app/shared/constants/app.constants";
import { LoadingIndicatorComponent } from "@/app/shared/components/loading-indicator/loading-indicator.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { LargePulseFooterComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-footer/large-pulse-footer.component";
import { LargePulseFooterRowComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-footer-row/large-pulse-footer-row.component";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { CategoryFilterComponent } from "@/app/shared/components/category-filter/category-filter.component";
import { ICategory } from "@/app/shared/interfaces/category.interface";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";

@Component({
    selector: "app-pulses",
    templateUrl: "./pulses.component.html",
    styleUrl: "./pulses.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        SvgIconComponent,
        InfiniteScrollDirective,
        LoadingIndicatorComponent,
        InputSearchComponent,
        LargePulseComponent,
        PromoteAdsComponent,
        LargePulseFooterComponent,
        LargePulseFooterRowComponent,
        FormatNumberPipe,
        CategoryFilterComponent,
        SpinnerComponent,
    ],
    providers: [InfiniteLoaderService],
})
export class PulsesComponent implements OnInit {
    private readonly pulseService = inject(PulseService);
    private readonly infiniteLoaderService = inject(InfiniteLoaderService);

    public pulses: ITopic[] = [];
    public isLoading: boolean = true;
    public addTopicRoute = "/" + AppRoutes.User.Topic.SUGGEST;
    public loading$: Observable<boolean>;
    public paginator$: Observable<IPaginator<ITopic>>;
    public searchInFocus: boolean = false;

    public ngOnInit(): void {
        this.getTrendingPulses();
    }

    public loadMore = this.infiniteLoaderService.loadMore.bind(this.infiniteLoaderService);

    public onSearchValueChange(searchValue: string): void {
        this.getTrendingPulses({ keyword: searchValue });
    }

    public onCategorySelected(category: ICategory | null): void {
        if (!category) {
            this.getTrendingPulses();
            return;
        }
        this.getTrendingPulses({ category: category.name });
    }

    public onSearchFocus(): void {
        this.searchInFocus = true;
    }

    public onSearchBlur(): void {
        this.searchInFocus = false;
    }

    private getTrendingPulses({
        keyword,
        category,
    }: { keyword?: string; category?: string } = {}): void {
        const take = AppConstants.PULSES_PER_PAGE;
        this.infiniteLoaderService.init({
            load: (page) =>
                this.pulseService
                    .get({
                        keyword,
                        category,
                        take,
                        skip: take * (page - 1),
                    })
                    .pipe(
                        first(),
                        map(
                            (pulses) =>
                                ({
                                    page,
                                    items: pulses,
                                    hasMorePages: pulses.length !== 0 && pulses.length === take,
                                } as IPaginator<ITopic>),
                        ),
                    ),
        });
        this.loading$ = this.infiniteLoaderService.loading$;
        this.paginator$ = this.infiniteLoaderService.paginator$;
    }
}
