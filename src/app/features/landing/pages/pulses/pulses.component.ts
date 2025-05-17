import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SvgIconComponent } from "angular-svg-icon";
import { BehaviorSubject, first, map, Observable } from "rxjs";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { IPaginator, IPulse } from "@/app/shared/interfaces";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { InputSearchComponent } from "./components/input-search/input-search.component";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { PromoteAdsComponent } from "./components/promote-ads/promote-ads.component";
import { InfiniteLoaderService } from "../../services/infinite-loader.service";
import { AppConstants } from "@/app/shared/constants/app.constants";
import { LoadingIndicatorComponent } from "@/app/shared/components/loading-indicator/loading-indicator.component";

@Component({
    selector: "app-pulses",
    templateUrl: "./pulses.component.html",
    styleUrl: "./pulses.component.scss",
    standalone: true,
    imports: [CommonModule, InfiniteScrollDirective, LoadingIndicatorComponent, InputSearchComponent, LargePulseComponent, PromoteAdsComponent],
    providers: [InfiniteLoaderService],
})
export class PulsesComponent implements OnInit {
    private readonly pulseService: PulseService = inject(PulseService);
    private readonly infiniteLoaderService: InfiniteLoaderService<IPulse> =
        inject(InfiniteLoaderService);

    public pulses: IPulse[] = [];
    public isLoading: boolean = true;
    public loading$ = new BehaviorSubject(true);
    public paginator$: Observable<IPaginator<IPulse>>;

    public ngOnInit(): void {
        this.getTrendingPulses();

    }

    public loadMore = this.infiniteLoaderService.loadMore.bind(this.infiniteLoaderService);

    public onSearchValueChange(searchValue: string): void {
        this.getTrendingPulses(searchValue);
    }

    private getTrendingPulses(keyword: string = ""): void {
        // this.isLoading = true;
        // this.pulseService
        //     .get({ keyword })
        //     .pipe(first())
        //     .subscribe((pulses) => {
        //         this.pulses = pulses;
        //         this.isLoading = false;
        //     });
        const take = AppConstants.PULSES_PER_PAGE;
        this.infiniteLoaderService.init({
            load: (page) => this.pulseService
                .get({
                    keyword,
                    take,
                    skip: take * (page - 1),
                })
                .pipe(
                    first(),
                    map((pulses) => ({
                        page,
                        items: pulses,
                        hasMorePages: pulses.length !== 0 && pulses.length === take,
                    } as IPaginator<IPulse>)),
                ),
        })
        this.loading$ = this.infiniteLoaderService.loading$;
        this.paginator$ = this.infiniteLoaderService.paginator$;
    }
}
