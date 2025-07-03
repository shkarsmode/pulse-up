import { inject, Injectable } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { BehaviorSubject, map, switchMap, take, tap } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { PulseService } from "../api/pulse.service";
import { pictureValidator } from "../../helpers/validators/picture.validator";
import { asyncValidator } from "../../helpers/validators/async.validator";
import { noConsecutiveNewlinesValidator } from "../../helpers/validators/no-consecutive-new-lines.validator";
import { arrayLengthValidator } from "../../helpers/validators/array-length-validator";
import { TopicLocation } from "@/app/features/user/interfaces/topic-location.interface";
import { NotificationService } from "./notification.service";
import { ProfileService } from "../profile/profile.service";

interface TopicFormValues {
    icon: File;
    headline: string;
    description: string;
    category: string;
    keywords: string[];
    picture?: File;
    location?: {
        country: string;
        state: string;
        city: string;
    };
}

@Injectable({
    providedIn: "root",
})
export class SendTopicService {
    public currentTopic: FormGroup;
    public submitting: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public resultId: string;
    public isTopicReadyForPreview: boolean = false;
    public customLocation: TopicLocation | null = null;
    public isTopicEditing: boolean = false;
    public startTopicLocatoinWarningShown = false;

    private readonly router = inject(Router);
    private readonly formBuilder = inject(FormBuilder);
    private readonly pulseService = inject(PulseService);
    private readonly notificationService = inject(NotificationService);
    private readonly profileService = inject(ProfileService);

    constructor() {
        this.currentTopic = this.formBuilder.group({
            icon: [null, [Validators.required, pictureValidator()]],
            headline: [
                "",
                [Validators.required, Validators.minLength(6), Validators.maxLength(60)],
                [
                    asyncValidator({
                        validationFn: this.pulseService.validateTitle.bind(this.pulseService),
                        error: {
                            notUnique:
                                "A topic with this name already exists. Please choose a different name.",
                        },
                    }),
                ],
            ],
            description: [
                "",
                [
                    Validators.required,
                    Validators.minLength(150),
                    Validators.maxLength(600),
                    noConsecutiveNewlinesValidator(),
                ],
            ],
            category: ["", Validators.required],
            keywords: [[], [Validators.required, arrayLengthValidator(1, 3)]],
            picture: [""],
            location: "",
        });
    }

    public setTopicLocation(location: TopicLocation) {
        this.customLocation = location;
        this.currentTopic
            .get("location")
            ?.setValue(
                [location.city, location.state, location.country].filter(Boolean).join(", "),
            );
    }

    public getFormValues(): TopicFormValues {
        const value = this.currentTopic.value;
        return {
            icon: value.icon,
            headline: value.headline.trim(),
            description: value.description.trim(),
            category: value.category,
            keywords: [value.category, ...value.keywords.map((keyword: string) => keyword.trim())],
            picture: value.picture,
            location: {
                country: value?.location?.country,
                state: value?.location?.state,
                city: value?.location?.city,
            },
        };
    }

    public createTopic(): void {
        if (this.currentTopic.invalid) return;
        const values = this.getFormValues();
        const params = {
            icon: values.icon,
            title: values.headline,
            description: values.description,
            category: values.category,
            picture: values.picture,
            keywords: values.keywords,
            location: {
                country: values.location?.country || "",
                state: values.location?.state,
                city: values.location?.city,
            },
            shareKey: "",
        };
        this.submitting.next(true);
        this.pulseService
            .getShareKeyFromTitle(values.headline)
            .pipe(
                take(1),
                tap((shareKey) => {
                    params["shareKey"] = !!shareKey ? shareKey : uuidv4();
                }),
                switchMap(() => this.pulseService.create(params)),
                switchMap((topic) => {
                    return this.profileService.refreshProfile().pipe(
                        map(() => topic)
                    )
                })
            )
            .subscribe({
                next: (topic) => {
                    this.currentTopic.reset();
                    this.pulseService.isJustCreatedTopic = true;
                    this.router.navigateByUrl(`/topic/${topic.id}`);
                    this.submitting.next(false);
                    this.startTopicLocatoinWarningShown = false;
                },
                error: (err) => {
                    console.error(err);
                    this.submitting.next(false);

                    const fallbackMessage = "Failed to create topic.";

                    if (err.status !== 400) {
                        this.notificationService.error(fallbackMessage);
                        return;
                    }

                    const errors = err.error?.errors;
                    if (!errors || typeof errors !== "object") {
                        this.notificationService.error(fallbackMessage);
                        return;
                    }

                    const firstFieldErrors = Object.values(errors)[0];

                    if (Array.isArray(firstFieldErrors) && firstFieldErrors.length > 0) {
                        this.notificationService.error(firstFieldErrors[0]);
                    } else {
                        this.notificationService.error(fallbackMessage);
                    }
                },
            });
    }

    public markAsReadyForPreview(): void {
        this.isTopicReadyForPreview = true;
    }

    public get topicsArrayKeywords(): Array<string> {
        const keywords = this.currentTopic.get("keywords")?.value;
        if (typeof keywords === "object") return keywords;

        const keywordsString = keywords || "";
        const keywordsArray = keywordsString
            .split(/[,;]+/)
            .map((keyword: string) => keyword.trim())
            .filter((keyword: string) => keyword.length > 0);

        return keywordsArray;
    }
}
