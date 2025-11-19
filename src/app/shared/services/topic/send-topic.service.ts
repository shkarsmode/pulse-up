import {
    MAX_DESCRIPTION_LENGTH,
    MIN_DESCRIPTION_LENGTH,
} from "@/app/features/user/helpers/error-message-builder";
import { TopicLocation } from "@/app/features/user/interfaces/topic-location.interface";
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
import { arrayLengthValidator } from "../../helpers/validators/array-length-validator";
import { asyncValidator } from "../../helpers/validators/async.validator";
import { descriptionLengthValidator } from "../../helpers/validators/descriptionLength.validator";
import { keywordsDuplicationValidator } from "../../helpers/validators/keywords-duplication.validator";
import { noConsecutiveNewlinesValidator } from "../../helpers/validators/no-consecutive-new-lines.validator";
import { pictureValidator } from "../../helpers/validators/picture.validator";
import { reservedKeywordsValidator } from "../../helpers/validators/reservedKeywordsValidator";
import { ITopic } from "../../interfaces";
import { PulseService } from "../api/pulse.service";
import { ProfileService } from "../profile/profile.service";

export interface TopicFormValues {
    id?: number | null;
    icon: File | string | null;
    headline: string;
    description: string;
    category: string;
    keywords: string[];
    picture?: File | string | null;
    location?: {
        country?: string;
        state?: string;
        city?: string;
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
    public startTopicLocationWarningShown = false;

    private readonly pulseService = inject(PulseService);
    private readonly profileService = inject(ProfileService);

    constructor() {
        this.currentTopic = new FormGroup(
            {
                id: new FormControl(null),
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
        const value: any = this.currentTopic.value;
    
        const normalizedIcon: File | string | null = value.icon ?? null;
        const normalizedPicture: File | string | null = value.picture ?? null;
    
        const rawKeywords: string[] = value.keywords || [];
    
        return {
            id: value?.id,
            icon: normalizedIcon,
            headline: (value.headline ?? "").trim(),
            description: (value.description ?? "").trim(),
            category: value.category,
            keywords: [
                value.category,
                ...rawKeywords.map((keyword: string) => keyword.trim()),
            ],
            picture: normalizedPicture,
            location: value.location ?? undefined,
        };
    }

    public createTopic(): Observable<ITopic | null> {
        if (this.currentTopic.invalid) return of(null);

        const values = this.getFormValues();
        const isEditTopic = !!values.id;
        const params: any = {
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
        
        if (isEditTopic) {
            params["id"] = values.id;
            delete params["location"];
            if (typeof params["icon"] === "string") {
                delete params["icon"];
            }
            if (typeof params["picture"] === "string") {
                delete params["picture"];
            }   
        }
        this.submitting.next(true);
        return this.pulseService.getShareKeyFromTitle(values.headline).pipe(
            take(1),
            tap((shareKey) => {
                params["shareKey"] = shareKey ? shareKey : uuidv4();
            }),
            switchMap(() => {
                if (isEditTopic) 
                    return this.pulseService.update(params);
                return this.pulseService.create(params)
            }),
            switchMap((topic) => {
                return from(this.profileService.refreshProfile()).pipe(map(() => topic));
            }),
            tap(() => {
                this.currentTopic.reset();
                this.pulseService.isJustCreatedTopic = !isEditTopic;
                this.submitting.next(false);
                this.startTopicLocationWarningShown = false;
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
