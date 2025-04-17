import { Component, HostListener, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { LoadImgPathDirective } from '../../../directives/load-img-path/load-img-path.directive';
import { IPulse } from '../../../interfaces';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';

@Component({
    selector: 'app-large-pulse',
    templateUrl: './large-pulse.component.html',
    styleUrl: './large-pulse.component.scss',
    standalone: true,
    imports: [LoadImgPathDirective, SvgIconComponent, FormatNumberPipe],
})
export class LargePulseComponent {
    @Input() public pulse: IPulse;

    private readonly router: Router = inject(Router);

    @HostListener('click')
    public onPulseClick(): void {
        this.router.navigateByUrl(`topic/${this.pulse.id}`);
    }
}
