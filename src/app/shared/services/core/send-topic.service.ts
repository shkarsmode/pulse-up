import { inject, Injectable } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { BehaviorSubject, first, switchMap, tap } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { PulseService } from "../api/pulse.service";
import { pictureValidator } from "../../helpers/validators/picture.validator";
import { asyncValidator } from "../../helpers/validators/async.validator";
import { noConsecutiveNewlinesValidator } from "../../helpers/validators/no-consecutive-new-lines.validator";
import { arrayLengthValidator } from "../../helpers/validators/array-length-validator";
import { TopicLocation } from "@/app/features/user/interfaces/topic-location.interface";
import { NotificationService } from "./notification.service";
import { GeocodeService } from "../api/geocode.service";
import { AppConstants } from "../../constants";

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

    private readonly router: Router = inject(Router);
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly pulseService: PulseService = inject(PulseService);
    private readonly geocodeService: GeocodeService = inject(GeocodeService);
    private readonly notificationService: NotificationService = inject(NotificationService);

    constructor() {
        this.currentTopic = this.formBuilder.group({
            icon: ["", [Validators.required, pictureValidator()]],
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
            location: this.formBuilder.group({
                country: [""],
                state: [""],
                city: [""],
            }),
        });

        this.geocodeService.getPlaceByCoordinates(
            AppConstants.DEFAULT_USER_LOCATION.longitude,
            AppConstants.DEFAULT_USER_LOCATION.latitude,
        ).subscribe((place) => {
            if (place) {
                const context = place.features[0].properties.context
                this.setTopicLocation({
                    country: context.country?.name || "",
                    state: context.region?.name || context.district?.name ||  "",
                    city: context.place?.name || "",
                    lng: AppConstants.DEFAULT_USER_LOCATION.longitude,
                    lat: AppConstants.DEFAULT_USER_LOCATION.latitude,
                })
            }
        })
    }

    public setTopicLocation(location: TopicLocation) {
        this.customLocation = location;
        this.currentTopic.patchValue({
            location: {
                country: location.country,
                state: location.state,
                city: location.city,
            },
        });
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
                tap((shareKey) => {
                    params["shareKey"] = !!shareKey ? shareKey : uuidv4();
                }),
                switchMap(() => this.pulseService.create(params)),
                first(),
            )
            .subscribe({
                next: (topic) => {
                    this.currentTopic.reset();
                    this.pulseService.isJustCreatedTopic = true;
                    this.router.navigateByUrl(`/topic/${topic.id}`);
                },
                error: (err) => {
                    console.error(err);

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
                complete: () => {
                    console.log("Topic created successfully.");
                    this.isTopicReadyForPreview = false;
                    this.submitting.next(false);
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
