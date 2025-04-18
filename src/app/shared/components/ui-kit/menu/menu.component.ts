import {
    Component,
    Input,
    TemplateRef,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, MatMenuModule],
    template: `
        <ng-container *ngIf="content">
            <span [matMenuTriggerFor]="menu" #trigger="matMenuTrigger">
                <ng-content></ng-content>
            </span>
            <mat-menu #menu="matMenu" class="menu">
                <ng-container *ngTemplateOutlet="content"></ng-container>
            </mat-menu>
        </ng-container>
    `,
    styleUrl: './menu.component.scss',
})
export class MenuComponent {
    @Input() content!: TemplateRef<any>;
    @ViewChild('trigger', { read: ElementRef }) triggerRef!: ElementRef;
}
