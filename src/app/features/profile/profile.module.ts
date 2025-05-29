import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProfileComponent } from "./profile.component";
import { ProfileRoutingModule } from "./profile.routing";
import { HeaderComponent } from "@/app/shared/components/header/header.component";
import { FooterComponent } from "@/app/shared/components/footer/footer.component";

@NgModule({
    declarations: [ProfileComponent],
    imports: [CommonModule, ProfileRoutingModule, HeaderComponent, FooterComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfileModule { }