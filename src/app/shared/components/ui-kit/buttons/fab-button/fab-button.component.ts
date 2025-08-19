import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";

@Component({
    selector: "app-fab-button",
    standalone: true,
    imports: [MatButtonModule],
    templateUrl: "./fab-button.component.html",
    styleUrl: "./fab-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FabButtonComponent {}
