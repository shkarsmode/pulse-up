import { CommonModule } from "@angular/common";
import { Component, ContentChild, Input, TemplateRef } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
    selector: "app-large-pulse-meta",
    standalone: true,
    imports: [AngularSvgIconModule, CommonModule],
    templateUrl: "./large-pulse-meta.component.html",
    styleUrl: "./large-pulse-meta.component.scss",
})
export class LargePulseMetaComponent {
    @Input() icon?: string;
    @Input({ required: true }) label: string;
    @Input({ required: true }) text: string;

    @ContentChild("iconTemplate") iconTemplate: TemplateRef<unknown> | null = null;
}
