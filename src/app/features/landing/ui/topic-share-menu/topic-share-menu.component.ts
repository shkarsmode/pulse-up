import { Component, Input, TemplateRef, ViewChild, ElementRef, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";

@Component({
    selector: "app-topic-share-menu",
    standalone: true,
    imports: [CommonModule, MatMenuModule, MatButtonModule],
    templateUrl: "./topic-share-menu.component.html",
    styleUrl: "./topic-share-menu.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicShareMenuComponent {
    @Input() content!: TemplateRef<unknown>;
    @ViewChild("trigger", { read: ElementRef }) triggerRef!: ElementRef;
}
