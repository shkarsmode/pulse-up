import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProfileComponent } from "./profile.component";
import { ProfileRoutingModule } from "./profile.routing";

@NgModule({
    declarations: [ProfileComponent],
    imports: [CommonModule, ProfileRoutingModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfileModule {}