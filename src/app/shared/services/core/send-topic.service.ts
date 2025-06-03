import { inject, Injectable } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { first } from "rxjs";
import { PulseService } from "../api/pulse.service";
import { pictureValidator } from "../../helpers/validators/picture.validator";
import { asyncValidator } from "../../helpers/validators/async.validator";
import { noConsecutiveNewlinesValidator } from "../../helpers/validators/no-consecutive-new-lines.validator";
import { arrayLengthValidator } from "../../helpers/validators/array-length-validator";
import { TopicLocation } from "@/app/features/user/interfaces/topic-location.interface";

@Injectable({
    providedIn: "root",
})
export class SendTopicService {
    public currentTopic: FormGroup;
    public userForm: FormGroup;
    public resultId: string;

    private readonly router: Router = inject(Router);
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly pulseService: PulseService = inject(PulseService);

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

        this.userForm = this.formBuilder.group({
            name: ["", Validators.required],
            phone: ["", Validators.required],
            email: ["", [Validators.required, Validators.email]],
        });
    }

    public setTopicLocation(location: TopicLocation) {
        this.currentTopic.patchValue({
            location: {
                country: location.country,
                state: location.state,
                city: location.city,
            },
        });
    }

    public createTopic(): void {
        if (this.currentTopic.invalid || this.userForm.invalid) return;

        // ! is success route "user/topic/submitted

        const params = {
            icon: this.currentTopic.value.icon,
            title: this.currentTopic.value.headline,
            description: this.currentTopic.value.description,
            category: this.currentTopic.value.category,
            picture: this.currentTopic.value.picture ?? null,
            keywords: this.topicsArrayKeywords,
            author: {
                name: this.userForm.value.name,
                phoneNumber: this.userForm.value.phone,
                email: this.userForm.value.email,
            },
            location: {
                country: "Test country",
                state: "Test state",
                city: "Test city",
            },
        };

        this.pulseService
            .create(params)
            .pipe(first())
            .subscribe(({ requestId }) => {
                this.resultId = requestId;

                this.userForm.reset();
                this.currentTopic.reset();
                this.router.navigateByUrl("user/topic/submitted");
            });
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
