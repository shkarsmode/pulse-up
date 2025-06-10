import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import { ShareButtonDirective } from 'ngx-sharebuttons';

type IconVariant = 'facebook' | 'x' | 'email';

@Component({
    selector: 'app-socials-button',
    template: `
        <button
            shareButton="{{ variant }}"
            [url]="url"
            [ngClass]="'socials-btn socials-btn_' + variant"
        >
            <svg-icon
                src="{{ iconsNames[variant] }}"
                class="socials-btn__icon"
            />
        </button>
    `,
    styleUrl: './socials-button.component.scss',
    imports: [ShareButtonDirective, SvgIconComponent, NgClass],
    standalone: true,
})
export class SocialsButtonComponent {
    @Input() variant: IconVariant;
    @Input() url: string;

    iconsNames: Partial<Record<IconVariant, string>> = {
        facebook: 'assets/svg/socials/fb.svg',
        x: 'assets/svg/socials/x.svg',
        email: 'assets/svg/mail.svg',
    };
}
