import { Component, inject } from '@angular/core';
import { IPulse } from '../../../../shared/interfaces';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { PulseService } from '../../../../shared/services/api/pulse.service';
import { catchError, first, of, take } from 'rxjs';
import { AppRoutes } from '../../../../shared/enums/app-routes.enum';

@Component({
  selector: 'app-pulse-heatmap-page',
  templateUrl: './pulse-heatmap-page.component.html',
  styleUrl: './pulse-heatmap-page.component.scss'
})
export class PulseHeatmapPageComponent {  
    public pulse: IPulse;
    public isLoading: boolean = true;

    private readonly router: Router = inject(Router);
    private readonly route: ActivatedRoute = inject(ActivatedRoute);
    private readonly pulseService: PulseService = inject(PulseService);

    public ngOnInit(): void {
        this.initPulseUrlIdListener();
    }

    private initPulseUrlIdListener(): void {
        this.route.paramMap
            .pipe(take(1))
            .subscribe(this.handlePulseUrlIdListener.bind(this));
    }

    private handlePulseUrlIdListener(data: ParamMap): void {
        const id = data.get('id')!;

        this.getPulseById(id);
    }

    private getPulseById(id: string | number): void {
        this.pulseService
            .getById(id)
            .pipe(
                first(), 
                catchError((error) => {
                    this.router.navigateByUrl('/'+AppRoutes.Community.INVALID_LINK);
                    return of(error);
                })
            )
            .subscribe((pulse) => {
                this.pulse = pulse;
                this.isLoading = false;
            });
    }

    public backToPulsePage(): void {
        this.router.navigateByUrl(`topic/${this.pulse.id}`);
    }

}
