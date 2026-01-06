import { tooltipText } from "@/app/features/user/constants/tooltip-text";
import { TopicDescriptionComponent } from "@/app/features/user/ui/topic-form/topic-description/topic-description.component";
import { TopicInfoComponent } from "@/app/features/user/ui/topic-form/topic-info/topic-info.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { SelectComponent } from "@/app/shared/components/ui-kit/select/select.component";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
    selector: "app-topic-input",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputComponent,
        SelectComponent,
        PrimaryButtonComponent,
        TopicDescriptionComponent,
        TopicInfoComponent
    ],
    template: `
        <div class="header">
             <h1>Create a Topic</h1>
             <div class="description-text">
                Start with a title and description. We'll help you polish the rest.
             </div>
        </div>

        <div class="card-container">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="group">
                    <app-input
                        id="title"
                        name="title"
                        label="Topic Title *"
                        formControlName="title"
                        placeholder="Enter a title"
                        [hasErrorClass]="!!form.get('title')?.invalid && !!form.get('title')?.touched"
                    />
                     <div class="group__info">
                        <app-topic-info [text]="tooltipText.title" />
                    </div>
                </div>

                <div class="group">
                     <app-topic-description
                        [textControl]="form.get('description')"
                        label="Description *"
                     />
                     <div class="group__info">
                        <app-topic-info [text]="tooltipText.description" />
                    </div>
                </div>

                <div class="group">
                    <app-select
                        id="audience"
                        name="audience"
                        label="Audience"
                        formControlName="audience"
                        [options]="audienceOptions"
                    />
                     <div class="group__info">
                       <app-topic-info text="Global means anyone can see this. Or choose a specific location." />
                    </div>
                </div>
                
                <div class="visuals-hint">
                     <img src="assets/svg/pulse-solid.svg" alt="Visuals" width="24" height="24"/>
                     <div>
                        <strong>Visuals</strong>
                        <p>Visuals will be generated automatically. You can customize them on the next screen.</p>
                     </div>
                </div>
            </form>
        </div>
        
        <div class="footer-action">
            <app-primary-button
                [fullWidth]="true"
                [disabled]="form.invalid"
                (handleClick)="onSubmit()"
            >
                Continue
            </app-primary-button>
        </div>
    `,
    styles: [`
        :host {
            display: block;
            max-width: 600px;
            margin: 0 auto;
        }
        .header { margin-bottom: 24px; }
        h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .description-text {
            color: var(--text-secondary);
            font-size: 14px;
        }
        .card-container {
            background: #fff;
            border: 1px solid #eee;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05); /* Premium shadow */
            margin-bottom: 24px;
            
            @media (max-width: 600px) {
                padding: 16px;
            }
        }
        .group {
            margin-bottom: 24px;
            position: relative;
        }
        .group__info {
            position: absolute;
            top: 0;
            right: 0;
            z-index: 10;
        }
        .visuals-hint {
            display: flex;
            gap: 12px;
            background: #f8f9fa; /* Lighter background */
            padding: 16px;
            border-radius: 12px;
            align-items: flex-start;
        }
        .visuals-hint strong {
            display: block;
            margin-bottom: 4px;
            font-size: 14px;
        }
        .visuals-hint p {
            margin: 0;
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.4;
        }
        .footer-action {
            /* If we wanted it sticky, but standard block is fine */
        }
    `]
})
export class TopicInputComponent {
    @Input() set initialData(value: { title: string; description: string; audience: string } | null) {
        if (value) {
            this.form.patchValue(value);
        }
    }

    @Output() next = new EventEmitter<{ title: string; description: string; audience: string }>();

    public form = new FormGroup({
        title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        description: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        audience: new FormControl<string>('Global', { nonNullable: true, validators: [Validators.required] })
    });

    public audienceOptions = ['Global'];
    public tooltipText = tooltipText;

    onSubmit() {
        if (this.form.valid) {
            this.next.emit(this.form.getRawValue());
        } else {
            this.form.markAllAsTouched();
        }
    }
}
