import { inject, Injectable } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
    BehaviorSubject,
    catchError,
    from,
    map,
    Observable,
    of,
    switchMap,
    take,
    tap,
    throwError,
} from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { PulseService } from "../api/pulse.service";
import { pictureValidator } from "../../helpers/validators/picture.validator";
import { asyncValidator } from "../../helpers/validators/async.validator";
import { noConsecutiveNewlinesValidator } from "../../helpers/validators/no-consecutive-new-lines.validator";
import { arrayLengthValidator } from "../../helpers/validators/array-length-validator";
import { TopicLocation } from "@/app/features/user/interfaces/topic-location.interface";
import { ProfileService } from "../profile/profile.service";
import { ITopic } from "../../interfaces";
import { keywordsDuplicationValidator } from "../../helpers/validators/keywords-duplication.validator";
import { reservedKeywordsValidator } from "../../helpers/validators/reservedKeywordsValidator";
import { descriptionLengthValidator } from "../../helpers/validators/descriptionLength.validator";
import {
    MAX_DESCRIPTION_LENGTH,
    MIN_DESCRIPTION_LENGTH,
} from "@/app/features/user/helpers/error-message-builder";

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
    public isTopicReadyForPreview = false;
    public topicLocation: TopicLocation | null = null;
    public isTopicEditing = false;
    public startTopicLocatoinWarningShown = false;

    private readonly pulseService = inject(PulseService);
    private readonly profileService = inject(ProfileService);

    constructor() {
        this.currentTopic = new FormGroup(
            {
                icon: new FormControl(null, [Validators.required, pictureValidator()]),
                headline: new FormControl(
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
                ),
                description: new FormControl("", [
                    Validators.required,
                    descriptionLengthValidator({
                        min: MIN_DESCRIPTION_LENGTH,
                        max: MAX_DESCRIPTION_LENGTH,
                    }),
                    noConsecutiveNewlinesValidator(),
                ]),
                category: new FormControl("", Validators.required),
                keywords: new FormControl(
                    [],
                    [arrayLengthValidator(1, 3), reservedKeywordsValidator()],
                ),
                picture: new FormControl(null, [Validators.required, pictureValidator()]),
                location: new FormControl(""),
            },
            {
                validators: [keywordsDuplicationValidator],
            },
        );
    }

    public setTopicLocation(location: TopicLocation) {
        this.topicLocation = location;
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

    public createTopic(): Observable<ITopic | null> {
        if (this.currentTopic.invalid) return of(null);
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
        return this.pulseService.getShareKeyFromTitle(values.headline).pipe(
            take(1),
            tap((shareKey) => {
                params["shareKey"] = shareKey ? shareKey : uuidv4();
            }),
            switchMap(() => this.pulseService.create(params)),
            switchMap((topic) => {
                return from(this.profileService.refreshProfile()).pipe(map(() => topic));
            }),
            tap(() => {
                this.currentTopic.reset();
                this.pulseService.isJustCreatedTopic = true;
                this.submitting.next(false);
                this.startTopicLocatoinWarningShown = false;
            }),
            catchError((error) => {
                console.error(error);
                this.submitting.next(false);

                const fallbackMessage = "Failed to create topic.";

                if (error.status !== 400) {
                    return throwError(() => new Error(fallbackMessage));
                }

                const errors = error.error?.errors;
                if (!errors || typeof errors !== "object") {
                    return throwError(() => new Error(fallbackMessage));
                }

                const firstFieldErrors = Object.values(errors)[0];

                if (Array.isArray(firstFieldErrors) && firstFieldErrors.length > 0) {
                    return throwError(() => new Error(firstFieldErrors[0]));
                } else {
                    return throwError(() => new Error(fallbackMessage));
                }
            }),
        );
    }

    public markAsReadyForPreview(): void {
        this.isTopicReadyForPreview = true;
    }

    public get topicsArrayKeywords(): string[] {
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
