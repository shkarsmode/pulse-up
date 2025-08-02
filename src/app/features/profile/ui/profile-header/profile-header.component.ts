import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
    selector: "app-profile-header",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./profile-header.component.html",
    styleUrl: "./profile-header.component.scss",
})
export class ProfileHeaderComponent {
    @Input() public heading = "";
}
