import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { PulseService } from '../api/pulse.service';

@Injectable({
    providedIn: 'root',
})
export class SendTopicService {
    public currentTopic: FormGroup;
    public userForm: FormGroup;
    public resultId: string;

    private formBuilder: FormBuilder = inject(FormBuilder);

    private readonly router: Router = inject(Router);
    private readonly pulseService: PulseService = inject(PulseService);

    constructor() {
        this.currentTopic = this.formBuilder.group({
            icon: ['', Validators.required],
            headline: ['', Validators.required],
            description: ['', Validators.required],
            category: ['', Validators.required],
            keywords: ['', Validators.required],
            picture: [''],
        });

        this.userForm = this.formBuilder.group({
            name: ['', Validators.required],
            phone: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
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
                country: 'Test country',
                state: 'Test state',
                city: 'Test city',
            },
        };

        this.pulseService
            .create(params)
            .pipe(first())
            .subscribe(({ requestId }) => {
                this.resultId = requestId;

                this.userForm.reset();
                this.currentTopic.reset();
                this.router.navigateByUrl('user/topic/submitted');
            });
    }

    public get topicsArrayKeywords(): Array<string> {
        const keywordsString = this.currentTopic.get('keywords')?.value || '';
        const keywordsArray = keywordsString
            .split(/[,;]+/)
            .map((keyword: string) => keyword.trim())
            .filter((keyword: string) => keyword.length > 0);

        return keywordsArray;
    }
}
