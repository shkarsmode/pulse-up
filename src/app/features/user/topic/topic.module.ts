import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { SvgIconComponent } from "angular-svg-icon";
import { PrimaryButtonComponent } from "../../../shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { SecondaryButtonComponent } from "../../../shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { SelectComponent } from "../../../shared/components/ui-kit/select/select.component";
import { UserModule } from "../user.module";
import { HowItWorksComponent } from "./how-it-works/how-it-works.component";
import { SubmittedComponent } from "./submitted/submitted.component";
import { SuggestComponent } from "./suggest/suggest.component";
import { TopicComponent } from "./topic.component";
import { TopicRoutingModule } from "./topic.routing";
import { PicturePickerComponent } from "@/app/shared/components/ui-kit/picture-picker/picture-picker.component";
import { PickLocationComponent } from "./pick-location/pick-location.component";
import { MapComponent } from "../../landing/ui/map/map.component";
import { MglMapComponent } from "../../landing/ui/maps/mgl-map.component";
import { PlacesAutocompleteComponent } from "../../../shared/components/places-autocomplete/places-autocomplete.component";
import { TopicPreviewComponent } from './topic-preview/topic-preview.component';
import { FadeInDirective } from "@/app/shared/animations/fade-in.directive";
import { FlatButtonDirective } from "@/app/shared/components/ui-kit/buttons/flat-button/flat-button.directive";
import { RippleEffectDirective } from "@/app/shared/directives/ripple-effect";

@NgModule({
    declarations: [
        TopicComponent,
        HowItWorksComponent,
        SubmittedComponent,
        SuggestComponent,
        PickLocationComponent,
        TopicPreviewComponent,
    ],
    imports: [
        CommonModule,
        TopicRoutingModule,
        UserModule,
        SelectComponent,
        SvgIconComponent,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
        PicturePickerComponent,
        MapComponent,
        MglMapComponent,
        PlacesAutocompleteComponent,
        FadeInDirective,
        FlatButtonDirective,
        RippleEffectDirective,
    ],
})
export class TopicModule {}
