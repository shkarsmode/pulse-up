import { LocationSource } from '@/app/shared/enums/location-source.enum';
import { CommonModule } from "@angular/common";
import { Component, ContentChild, Input, TemplateRef } from "@angular/core";
import { MatTooltip } from "@angular/material/tooltip";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
    selector: "app-large-pulse-meta",
    standalone: true,
    imports: [AngularSvgIconModule, CommonModule, MatTooltip],
    templateUrl: "./large-pulse-meta.component.html",
    styleUrl: "./large-pulse-meta.component.scss",
})
export class LargePulseMetaComponent {
    @Input() icon?: string;
    @Input() label?: string;
    @Input() accent?: boolean = false;
    @Input({ required: true }) text: string;

    @ContentChild("iconTemplate") iconTemplate: TemplateRef<unknown> | null = null;

    public LocationSource: typeof LocationSource = LocationSource;
}
