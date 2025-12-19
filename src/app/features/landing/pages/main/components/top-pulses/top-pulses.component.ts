import { TopPulsesService } from "@/app/features/landing/pages/main/components/top-pulses/top-pulses.service";
import {
    SmallPulseBadgeComponent,
    SmallPulseComponent,
    SmallPulseHeaderComponent,
    SmallPulseIconComponent,
    SmallPulseStatsComponent,
    SmallPulseStatsItemComponent,
    SmallPulseSubtitleComponent,
    SmallPulseTitleComponent,
} from "@/app/shared/components/pulses/small-pulse";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { SkeletonComponent } from "@/app/shared/components/ui-kit/skeleton/skeleton.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { Colors } from "@/app/shared/enums/colors.enum";
import { ISiteStats } from '@/app/shared/interfaces/site-stats.interface';
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { PulseService } from '@/app/shared/services/api/pulse.service';
import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { RouterModule } from "@angular/router";
import { first } from 'rxjs';

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
export class TopPulsesComponent implements OnInit {
    private topPulsesService = inject(TopPulsesService);

    public topics = this.topPulsesService.topics;
    public isLoading = this.topPulsesService.isLoading;
    public isError = this.topPulsesService.isError;
    public AppRoutes = AppRoutes;
    public buttonColor = Colors.BLACK;

    public stats: WritableSignal<ISiteStats> = signal({ 
        activeTopics: 0, 
        totalUsers: 0, 
        totalVotes: 0, 
        lastDayVotes: 0 
    });

    private pulseService = inject(PulseService);
    ngOnInit(): void {
        this.pulseService.getSiteStats().pipe(first()).subscribe((stats) => {
            this.stats.set(stats);
        })
    }
}
