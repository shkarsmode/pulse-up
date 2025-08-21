import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
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
import { TopPulsesService } from "@/app/features/landing/pages/main/components/top-pulses/top-pulses.service";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { SkeletonComponent } from "@/app/shared/components/ui-kit/skeleton/skeleton.component";

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
        FormatNumberPipe,
        SkeletonComponent,
    ],
})
export class TopPulsesComponent {
    private topPulsesService = inject(TopPulsesService);

    public topics = this.topPulsesService.topics;
    public isLoading = this.topPulsesService.isLoading;
    public isError = this.topPulsesService.isError;
    public AppRoutes = AppRoutes;
    public buttonColor = Colors.BLACK;
}
