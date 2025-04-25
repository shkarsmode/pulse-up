import { Component, inject, OnInit } from '@angular/core';
import { first } from 'rxjs';
import { IPulse } from '../../../../../../shared/interfaces';
import { PulseService } from '../../../../../../shared/services/api/pulse.service';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';

@Component({
    selector: 'app-top-pulses',
    templateUrl: './top-pulses.component.html',
    styleUrl: './top-pulses.component.scss',
})
export class TopPulsesComponent implements OnInit {
    public pulses: IPulse[] = [];
    public AppRoutes = AppRoutes;

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
