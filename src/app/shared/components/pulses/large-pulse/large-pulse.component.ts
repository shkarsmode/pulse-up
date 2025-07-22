import { Component, HostListener, inject, Input } from '@angular/core';
import { Router, ɵEmptyOutletComponent } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { LoadImgPathDirective } from '../../../directives/load-img-path/load-img-path.directive';
import { ITopic, TopicState } from '../../../interfaces';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';

@Component({
    selector: 'app-large-pulse',
    templateUrl: './large-pulse.component.html',
    styleUrl: './large-pulse.component.scss',
    standalone: true,
    imports: [CommonModule, LoadImgPathDirective],
})
export class LargePulseComponent {
    @Input() public pulse: ITopic;

    private readonly router: Router = inject(Router);

    public archived = false;

    ngOnChanges(): void {
        this.archived = this.pulse?.state === TopicState.Archived;
    }

    @HostListener('click')
    public onPulseClick(): void {
        this.router.navigateByUrl(`topic/${this.pulse.id}`);
    }
}
