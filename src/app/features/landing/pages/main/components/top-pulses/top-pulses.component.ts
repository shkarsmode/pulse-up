import { Component, DestroyRef, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { Colors } from "@/app/shared/enums/colors.enum";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import {
    SmallPulseComponent,
    SmallPulseBadgeComponent,
    SmallPulseHeaderComponent,
    SmallPulseIconComponent,
    SmallPulseStatsComponent,
    SmallPulseStatsItemComponent,
    SmallPulseSubtitleComponent,
    SmallPulseTitleComponent,
} from "@/app/shared/components/pulses/small-pulse";

@Component({
    selector: "app-top-pulses",
    templateUrl: "./top-pulses.component.html",
    styleUrl: "./top-pulses.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        SecondaryButtonComponent,
        SmallPulseComponent,
        SmallPulseHeaderComponent,
        SmallPulseIconComponent,
        SmallPulseBadgeComponent,
        SmallPulseStatsComponent,
        SmallPulseStatsItemComponent,
        SmallPulseTitleComponent,
        SmallPulseSubtitleComponent,
    ],
})
export class TopPulsesComponent {
    private readonly destroyRef = inject(DestroyRef);
    private readonly pulseService: PulseService = inject(PulseService);

    public data$ = this.pulseService
        .getLeaderboardTopics({
            count: 3,
            timeframe: "last24Hours",
            includeTopicDetails: true,
        })
        .pipe(
            map((response) => response.results),
            takeUntilDestroyed(this.destroyRef),
        );
    public AppRoutes = AppRoutes;
    public buttonColor = Colors.BLACK;
}
