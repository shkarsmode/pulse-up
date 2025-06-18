import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SvgIconComponent } from "angular-svg-icon";
import { FooterComponent } from "@/app/shared/components/footer/footer.component";
import { HeaderComponent } from "@/app/shared/components/header/header.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { ChipsInputComponent } from "@/app/shared/components/ui-kit/chips-input/chips-input.component";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { SelectComponent } from "@/app/shared/components/ui-kit/select/select.component";
import { PulsePlaceholderComponent } from "./ui/pulse-placeholder/pulse-placeholder.component";
import { TopicFormComponent } from "./ui/topic-form/topic-form.component";
import { UserComponent } from "./user.component";
import { UserRoutingModule } from "./user.routing";
import { PicturePickerComponent } from "@/app/shared/components/ui-kit/picture-picker/picture-picker.component";
import { TextareaComponent } from "@/app/shared/components/ui-kit/textarea/textarea.component";
import { TopicDescriptionComponent } from "./ui/topic-form/topic-description/topic-description.component";
import { TopicInfoComponent } from "./ui/topic-form/topic-info/topic-info.component";
import { LocationPickerComponent } from "./ui/topic-form/location-picker/location-picker.component";

@NgModule({
    declarations: [UserComponent, TopicFormComponent, PulsePlaceholderComponent],
    imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SelectComponent,
    HeaderComponent,
    FooterComponent,
    InputComponent,
    SvgIconComponent,
    PrimaryButtonComponent,
    ChipsInputComponent,
    PicturePickerComponent,
    TextareaComponent,
    TopicDescriptionComponent,
    TopicInfoComponent,
    LocationPickerComponent,
],
    exports: [TopicFormComponent, PulsePlaceholderComponent],
})
export class UserModule {}
