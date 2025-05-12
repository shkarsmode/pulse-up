import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { first } from 'rxjs';
import { IPulse } from '../../../../../../shared/interfaces';
import { PulseService } from '../../../../../../shared/services/api/pulse.service';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';
import { Colors } from '@/app/shared/enums/colors.enum';
import { SecondaryButtonComponent } from '@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component';
import { TopPulseCardComponent } from '@/app/shared/components/pulses/top-pulse/top-pulse-card.component';

@Component({
    selector: 'app-top-pulses',
    templateUrl: './top-pulses.component.html',
    styleUrl: './top-pulses.component.scss',
    standalone: true,
    imports: [
        RouterModule,
        SecondaryButtonComponent,
        TopPulseCardComponent
    ],
})
export class TopPulsesComponent implements OnInit {
    public pulses: IPulse[] = [];
    public AppRoutes = AppRoutes;
    public buttonColor = Colors.BLACK;

    private readonly pulseService: PulseService = inject(PulseService);

    public ngOnInit(): void {
        this.setTop3Pulses();
    }

    private setTop3Pulses(): void {
        this.pulseService
            .get()
            .pipe(first())
            .subscribe((pulses) => {
                pulses.length = 3;
                this.pulses = pulses;
            });
    }
}
