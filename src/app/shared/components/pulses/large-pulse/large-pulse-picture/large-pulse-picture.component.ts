import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { ImageComponent } from "../../../ui-kit/image/image.component";

@Component({
    selector: "app-large-pulse-picture",
    standalone: true,
    imports: [ImageComponent],
    templateUrl: "./large-pulse-picture.component.html",
    styleUrl: "./large-pulse-picture.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LargePulsePictureComponent {
    @Input() src = "";
    @Input() alt = "";
}
