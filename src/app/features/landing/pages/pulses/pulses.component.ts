import { Component, inject, OnInit } from '@angular/core';
import { first } from 'rxjs';
import { IPulse } from '@/app/shared/interfaces';
import { PulseService } from '@/app/shared/services/api/pulse.service';

@Component({
    selector: 'app-pulses',
    templateUrl: './pulses.component.html',
    styleUrl: './pulses.component.scss',
})
export class PulsesComponent implements OnInit {
    public pulses: IPulse[] = [];
    public isLoading: boolean = true;

    private readonly pulseService: PulseService = inject(PulseService);

    public ngOnInit(): void {
        this.getTrendingPulses();
    }

    public onSearchValueChange(searchValue: string): void {
        this.getTrendingPulses(searchValue);
    }

    private getTrendingPulses(keyword: string = ''): void {
        this.isLoading = true;
        this.pulseService
            .get({ keyword })
            .pipe(first())
            .subscribe((pulses) => {
                this.pulses = pulses;
                this.isLoading = false;
            });
    }
}
