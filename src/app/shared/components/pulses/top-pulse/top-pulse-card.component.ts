import { Component, HostBinding, HostListener, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { LoadImgPathDirective } from '../../../directives/load-img-path/load-img-path.directive';
import { IPulse } from '../../../interfaces';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';

@Component({
    selector: 'app-top-pulse-card',
    standalone: true,
    imports: [LoadImgPathDirective, SvgIconComponent, FormatNumberPipe],
    templateUrl: './top-pulse-card.component.html',
    styleUrl: './top-pulse-card.component.scss',
})
export class TopPulseCardComponent {
    @Input() public pulse: IPulse;
    @Input() public index: number;
    @Input() public interactive: boolean = true;

    private readonly router: Router = inject(Router);

    @HostBinding('class.intercactive')
    public get isInteractive() {
        return this.interactive;
    }

    @HostListener('click')
    public onPulseClick(): void {
        if (this.interactive) {
            this.router.navigateByUrl(`topic/${this.pulse.id}`);
        }
    }
}
