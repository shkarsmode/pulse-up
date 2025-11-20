import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, OnInit, Output } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable, take } from 'rxjs';

import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { SendTopicService } from "@/app/shared/services/topic/send-topic.service";

import { tooltipText } from "../../constants/tooltip-text";
import { ErrorMessageBuilder } from "../../helpers/error-message-builder";

import { CropResult } from "../../interfaces/crop-result.interface";
import {
    CropImagePopupComponent,
    CropImagePopupData,
} from "../crop-image-popup/crop-image-popup.component";
import { TopicLocationInfoPopupComponent } from "../topic-location-info-popup/topic-location-info-popup.component";

import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { ChipsInputComponent } from "@/app/shared/components/ui-kit/chips-input/chips-input.component";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { PicturePickerComponent } from "@/app/shared/components/ui-kit/picture-picker/picture-picker.component";
import { SelectComponent } from "@/app/shared/components/ui-kit/select/select.component";
import { SettingsService } from '@/app/shared/services/api/settings.service';
import { ProfileService } from '@/app/shared/services/profile/profile.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DescriptionImagePickerComponent } from "./description-image-picker/description-image-picker.component";
import { LocationPickerComponent } from "./location-picker/location-picker.component";
import { TopicDescriptionComponent } from "./topic-description/topic-description.component";
import { TopicInfoComponent } from "./topic-info/topic-info.component";

interface Topic {
    name: string;
    title: string;
    description: string;
}

@Component({
    selector: "app-topic-form",
    templateUrl: "./topic-form.component.html",
    styleUrl: "./topic-form.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PicturePickerComponent,
        TopicInfoComponent,
        InputComponent,
        SelectComponent,
        TopicDescriptionComponent,
        ChipsInputComponent,
        LocationPickerComponent,
        PrimaryButtonComponent,
        DescriptionImagePickerComponent,
    ],
})
export class TopicFormComponent implements OnInit {
    @Output() public handleSubmit = new EventEmitter<void>();

    public readonly pulseService: PulseService = inject(PulseService);
    public readonly sendTopicService: SendTopicService = inject(SendTopicService);
    public readonly notificationService: NotificationService = inject(NotificationService);
    public readonly settingsService = inject(SettingsService);
    
    private readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);
    private readonly activatedRoute = inject(ActivatedRoute);
    private blobUrlPrefix = toSignal(
        this.settingsService.settings$.pipe(map((settings) => settings.blobUrlPrefix)),
        { initialValue: "" },
    );
    public profileService: ProfileService = inject(ProfileService);

    private popupShown = this.sendTopicService.startTopicLocationWarningShown;

    public routes = AppRoutes.User.Topic;
    public topicForm: FormGroup = this.sendTopicService.currentTopic;
    public selectedIcon = this.sendTopicService.currentTopic.get("icon")?.value || null;
    public categoriesForForm: Observable<string[]>;
    public categories: Topic[] = categories;
    public tooltipText = tooltipText;

    public isEditMode = false;
    private currentTopicId: number | null = null;

    public ngOnInit(): void {
        console.log(this.topicForm.value);
        console.log(this.sendTopicService.currentTopic.value);
        this.categoriesForForm = this.pulseService.categories$.pipe(
            map((categories) => categories.map((category) => category.name)),
        );

        this.initEditModeIfNeeded();
    }

    public control(name: string) {
        return this.topicForm.get(name);
    }

    public getErrorMessage(name: string) {
        const control = this.topicForm.get(name);
        if (!control) {
            return null;
        }
        return ErrorMessageBuilder.getErrorMessage(control, name);
    }

    public onBlur(name: string) {
        const control = this.topicForm.get(name);
        if (control) {
            control.markAsTouched();
        }
    }

    public onSelectIcon(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
            return;
        }

        const dialogRef = this.dialog.open<CropImagePopupComponent, CropImagePopupData>(
            CropImagePopupComponent,
            {
                width: "100%",
                maxWidth: "630px",
                panelClass: "custom-dialog-container",
                backdropClass: "custom-dialog-backdrop",
                data: {
                    event: event,
                    minWidth: 128,
                    minHeight: 128,
                    aspectRatio: 1,
                    maintainAspectRatio: true,
                },
            },
        );

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe((result) => this.onCroppedImage(result));
    }

    public onDeleteIcon(): void {
        this.selectedIcon = null;
        this.topicForm.get("icon")?.setValue(null);
    }

    public getCurrentTopicInfo(): { title: string; description: string } {
        const selectedCategory = this.topicForm.get("category")?.value;
        return this.categories.filter((categoryObj) => categoryObj.name === selectedCategory)[0];
    }

    public onNextButtonClick(): void {
        this.sendTopicService.currentTopic = this.topicForm;
        if (!this.topicForm.get("location")?.value && !this.popupShown) {
            this.popupShown = true;
            this.sendTopicService.startTopicLocationWarningShown = true;
            return this.showLocationWarning({
                onClose: () => {
                    this.submitForm();
                },
            });
        }
        this.submitForm();
    }

    public submitForm(): void {
        this.topicForm.markAllAsTouched();
        this.topicForm.updateValueAndValidity();

        if (this.topicForm.valid) {
            this.handleSubmit.emit();
            this.sendTopicService.markAsReadyForPreview();
        }
    }

    private onCroppedImage = (result: CropResult) => {
        if (result.success) {
            this.selectedIcon = result.imageFile;
            this.topicForm.get("icon")?.setValue(result.imageFile);
        } else if (result.message) {
            this.notificationService.error(result.message);
        }
    };

    private showLocationWarning({ onClose }: { onClose: () => void }): void {
        const dialogRef = this.dialog.open(TopicLocationInfoPopupComponent, {
            maxWidth: "630px",
            panelClass: "custom-dialog-container",
            backdropClass: "custom-dialog-backdrop",
        });

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe((result) => {
                if (result) {
                    onClose();
                }
            });
    }

    private initEditModeIfNeeded(): void {
        const topicIdParam = this.activatedRoute.snapshot.paramMap.get("id");

        if (!topicIdParam) {
            if (this.sendTopicService.currentTopic.get("id")?.value) {
                this.topicForm.reset();
                this.sendTopicService.currentTopic.reset();
                this.selectedIcon = null;
            }
            return;
        }

        this.isEditMode = true;
        this.currentTopicId = Number(topicIdParam);
        this.popupShown = true;

        const lastTopicEditId = this.sendTopicService.currentTopic.get("id")?.value;
        if (
            lastTopicEditId && 
            this.currentTopicId === lastTopicEditId
        ) {
            return;
        }

        this.pulseService
            .getById(topicIdParam)
            .pipe(take(1))
            .subscribe({
                next: (topic: any) => {
                    this.patchFormWithTopic(topic);
                },
                error: () => {
                    this.notificationService.error("Failed to load topic for editing.");
                },
            });
    }

    private buildMediaUrl(path: string | null | undefined): string | null {
        if (!path) {
            return null;
        }
    
        if (path.startsWith("http") || path.startsWith("blob:")) {
            return path;
        }
    
        let apiBaseOrigin: string;
    
        try {
            const apiUrl = this.blobUrlPrefix();
            apiBaseOrigin = new URL(apiUrl, window.location.origin).origin;
        } catch {
            return path;
        }
    
        return `${apiBaseOrigin}${path}`;
    }

    private patchFormWithTopic(topic: any): void {
        if (topic.authorId !== this.profileService.profile()?.id) {
            this.notificationService.info('You can\'t edit someones topic');
            this.router.navigateByUrl('/topics');
            return;
        }
        const iconUrl = this.buildMediaUrl(topic.icon);
        const pictureUrl = this.buildMediaUrl(topic.picture);

        this.sendTopicService.currentTopic.get("id")?.setValue(topic.id);

        this.topicForm.patchValue({
            id: topic.id,
            icon: iconUrl,
            headline: topic.title ?? "",
            description: topic.description ?? "",
            picture: pictureUrl,
            category: topic.category ?? null,
            keywords: topic.keywords.filter((keyword: string) => keyword.toLocaleLowerCase() !== topic?.category.toLocaleLowerCase()) ?? [],
            location: topic.location ?? null,
        });

        this.sendTopicService.currentTopic.setValue(this.topicForm.value);        

        const headlineControl = this.topicForm.get("headline");
        if (headlineControl) {
            headlineControl.clearAsyncValidators();
            headlineControl.updateValueAndValidity({ emitEvent: false });
        }

        this.selectedIcon = iconUrl;
    }
}

const categories = [
    {
        name: "Politics",
        title: "Topics related to government policies, political movements, elections, and political figures",
        description: "Examples: Election campaigns, policy reforms, political endorsements.",
    },
    {
        name: "Social",
        title: "Topics that address societal issues, community initiatives, and social movements",
        description:
            "Examples: Social justice campaigns, community events, public health initiatives.",
    },
    {
        name: "Environment",
        title: "Topics focused on environmental issues, sustainability, and conservation efforts",
        description:
            "Examples: Climate change initiatives, wildlife conservation, renewable energy projects.",
    },
    {
        name: "Health",
        title: "Topics related to public health, healthcare policies, medical advancements, and wellness",
        description:
            "Examples: Healthcare reforms, mental health awareness, medical research breakthroughs.",
    },
    {
        name: "Technology",
        title: "Topics covering advancements in technology, digital innovations, and tech-related policies",
        description:
            "Examples: Open source software support, data protection advocacy, tech industry news.",
    },
    {
        name: "Economy",
        title: "Topics concerning economic policies, financial initiatives, market trends, and economic reforms",
        description:
            "Examples: Wealth redistribution, financial literacy promotion, economic stability measures.",
    },
    {
        name: "Education",
        title: "Topics related to educational policies, reforms, initiatives, and advancements in learning",
        description:
            "Examples: STEM education expansion, student loan forgiveness, homeschooling support.",
    },
    {
        name: "Entertainment",
        title: "Topics covering the entertainment industry, media, celebrity culture, and related events",
        description: "Examples: Movie awards, reality TV discussions, celebrity endorsements.",
    },
    {
        name: "Lifestyle",
        title: "Topics that pertain to personal well-being, cultural trends, and lifestyle choices",
        description: "Examples: Body positivity, veganism promotion, volunteerism encouragement.",
    },
    {
        name: "Rights",
        title: "Topics focused on civil rights, human rights, and advocacy for individual freedoms",
        description: "Examples: Disability rights, reproductive rights, free speech defense.",
    },
    {
        name: "Culture",
        title: "Topics that celebrate diverse cultures, traditions, and cultural initiatives",
        description:
            "Examples: Cultural diversity support, indigenous peoples' rights, celebration of cultural figures.",
    },
    {
        name: "Science",
        title: "Topics related to scientific research, innovations, and advancements across various fields",
        description: "Examples: Climate science, medical research, technological innovations.",
    },
    {
        name: "Community",
        title: "Topics that emphasize community engagement, local initiatives, and community support",
        description:
            "Examples: Homelessness solutions, affordable housing, community volunteerism.",
    },
    {
        name: "International",
        title: "Topics that address global issues, international relations, and cross-border initiatives",
        description:
            "Examples: International oil markets stabilization, global immigration policies, data protection laws.",
    },
    {
        name: "Sports",
        title: "Topics related to various sports leagues, teams, events, and fan support",
        description:
            "Examples: NFL team support, MLB team rallies, NBA team pride, MLS team enthusiasm.",
    },
];
