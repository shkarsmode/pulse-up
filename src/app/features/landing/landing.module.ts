import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";

import { FooterComponent } from "../../shared/components/footer/footer.component";
import { HeaderComponent } from "../../shared/components/header/header.component";
import { LandingComponent } from "./landing.component";
import { LandingRoutingModule } from "./landing.routing";

@NgModule({
    declarations: [LandingComponent],
    imports: [LandingRoutingModule, HeaderComponent, FooterComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LandingModule {}
