import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { catchError, first, of, take } from 'rxjs';
import { AppRoutes } from '../../../../shared/enums/app-routes.enum';
import { IPulse } from '../../../../shared/interfaces';
import { PulseService } from '../../../../shared/services/api/pulse.service';

@Component({
    selector: 'app-pulse-page',
    templateUrl: './pulse-page.component.html',
    styleUrl: './pulse-page.component.scss',
})
export class PulsePageComponent implements OnInit {
    public pulse: IPulse;
    public isReadMore: boolean = false;
    public isLoading: boolean = true;
    public topPulses: IPulse[] = [];

    @ViewChild('description', {static: false}) public description: ElementRef<HTMLDivElement>;

    private readonly router: Router = inject(Router);
    private readonly route: ActivatedRoute = inject(ActivatedRoute);
    private readonly pulseService: PulseService = inject(PulseService);
    

    public ngOnInit(): void {
        this.initPulseUrlIdListener();
        this.setTopPulses();
    }

    private setTopPulses(): void {
        this.pulseService.get()
            .pipe(first())
                .subscribe(pulses => {
                this.topPulses = pulses.slice(0, 3);
            })
    }

    public onReadMore(): void {
        this.isReadMore = true;
    }

    private initPulseUrlIdListener(): void {
        this.route.paramMap
            .pipe(take(1))
            .subscribe(this.handlePulseUrlIdListener.bind(this));
    }

    private handlePulseUrlIdListener(data: ParamMap): void {
        const id = data.get('id')!;

        // if (!id || 'number' !== typeof id) {
        //     console.error('Invalid pulse ID');
        //     this.router.navigateByUrl('/');
        //     return;
        // }

        this.getPulseById(id);
    }

    private getPulseById(id: string | number): void {
        this.pulseService
            .getById(id)
            .pipe(
                first(), 
                catchError((error) => {
                    this.router.navigateByUrl('/'+ AppRoutes.Community.INVALID_LINK);
                    return of(error);
                })
            )
            .subscribe((pulse) => {
                this.pulse = pulse;
                this.isLoading = false;
                this.determineIfNeedToRemoveShowMoreButton();
                this.createLink(pulse.description);
            });
    }

    private determineIfNeedToRemoveShowMoreButton(): void {
        setTimeout(() => {
            const textElement = this.description.nativeElement;

            const fullHeight = textElement!.scrollHeight;
            const visibleHeight = textElement!.clientHeight + 2;
            const isTruncated = visibleHeight < fullHeight;

            this.isReadMore = !isTruncated;
        }, 100);
    }

    // private createLink(value: string): void {
    //     let link = value.split(' ').find(word => word.startsWith('http'));
    //     // if(!link) return;

    //     this.pulse.description = value.split(' ').filter(el => el !== link).join(' ');

    //     let a = document.createElement('a') as HTMLElement;
    //     a.innerText = link;
    //     a.href = link;

    //     console.log(a);
    //     this.description.nativeElement.appendChild(a);

    // }

    private createLink(value: string): void {
        let link = this.extractUrl(value);
        
        if(!link) return

        this.pulse.description = value.replace(link, '');

        this.pulse.description = this.pulse.description + `<a href="${link}">${link}</a>`
    }

    private extractUrl(value: string): string | null {
        // Regular expression to match URLs (basic version)
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = value.match(urlRegex);
    
        // If there's a match, return the first URL, otherwise return null
        return match ? match[0] : null;
    }
    

    
}

