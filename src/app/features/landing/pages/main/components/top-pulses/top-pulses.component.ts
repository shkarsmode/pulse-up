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
import { TopTopicsService } from "@/app/shared/services/topic/topTopics.service";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";

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
    ],
})
export class TopPulsesComponent {
    private topTopicsService = inject(TopTopicsService);

    public topics$ = this.topTopicsService.topics$;
    public AppRoutes = AppRoutes;
    public buttonColor = Colors.BLACK;
}
