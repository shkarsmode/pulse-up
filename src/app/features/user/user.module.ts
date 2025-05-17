import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SvgIconComponent } from 'angular-svg-icon';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { PrimaryButtonComponent } from '../../shared/components/ui-kit/buttons/primary-button/primary-button.component';
import { ChipsInputComponent } from '../../shared/components/ui-kit/chips-input/chips-input.component';
import { InputComponent } from '../../shared/components/ui-kit/input/input.component';
import { SelectComponent } from '../../shared/components/ui-kit/select/select.component';
import { PulsePlaceholderComponent } from './components/pulse-placeholder/pulse-placeholder.component';
import { TopicFormComponent } from './components/topic-form/topic-form.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserComponent } from './user.component';
import { UserRoutingModule } from './user.routing';

@NgModule({
    declarations: [
        UserComponent,
        TopicFormComponent,
        UserFormComponent,
        PulsePlaceholderComponent
    ],
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
        ChipsInputComponent
    ],
    exports: [TopicFormComponent, UserFormComponent, PulsePlaceholderComponent],
})
export class UserModule {}
