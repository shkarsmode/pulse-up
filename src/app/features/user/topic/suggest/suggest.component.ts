import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { ContentAssistService } from "@/app/shared/services/api/content-assist.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { SendTopicService } from "@/app/shared/services/topic/send-topic.service";
import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { finalize, forkJoin } from "rxjs";
import { TopicInputComponent } from "./components/topic-input.component";
import { TopicPolishReviewComponent } from "./components/topic-polish-review.component";

type Step = 'input' | 'processing' | 'review';

@Component({
    selector: 'app-suggest',
    templateUrl: './suggest.component.html',
    styleUrl: './suggest.component.scss',
    standalone: true,
    imports: [CommonModule, TopicInputComponent, TopicPolishReviewComponent],
})
export class SuggestComponent {
    private readonly contentAssistHelper = inject(ContentAssistService);
    private readonly router = inject(Router);

    public currentStep = signal<Step>('input');
    public polishData = signal<any>(null); // Store API results

    // Temporary storage for input to allow "Edit Original"
    public originalInput: { title: string; description: string; audience: string } | null = null;

    private readonly notificationService = inject(NotificationService);

    onInputSubmit(input: { title: string; description: string; audience: string }) {
        this.originalInput = input;
        this.currentStep.set('processing');

        // Parallel API calls
        forkJoin({
            polish: this.contentAssistHelper.polishTopic({
                title: input.title,
                description: input.description
            }),
            pictures: this.contentAssistHelper.generatePictures({
                title: input.title,
                description: input.description,
                inferCoverImage: true,
                inferPhotoIcon: true,
                inferSymbolicIcon: true
            })
        }).pipe(
            finalize(() => {
                // Handle errors?
            })
        ).subscribe({
            next: (results) => {
                this.polishData.set({
                    polishedTitle: results.polish.title,
                    polishedDescription: results.polish.description,
                    tags: results.polish.tags,
                    coverImage: results.pictures.imageUrl,
                    photoIcon: results.pictures.photoIconUrl,
                    symbolicIcon: results.pictures.symbolicIconUrl,
                    ...input // access to audience etc
                });
                this.currentStep.set('review');
            },
            error: (err) => {
                console.error('AI Polish failed', err);
                let message = 'An unexpected error occurred. Please try again.';

                const errorBody = err.error as any;

                // Try to extract useful message from ProblemDetails
                if (errorBody) {
                    if (errorBody.detail) {
                        message = errorBody.detail;
                    } else if (errorBody.title) {
                        message = errorBody.title;
                    } else if (errorBody.errors) {
                        // Sometimes validation errors come in 'errors' object
                        const firstError = Object.values(errorBody.errors)[0];
                        if (Array.isArray(firstError)) {
                            message = firstError[0] as string;
                        }
                    }
                }

                this.notificationService.error(message);
                this.currentStep.set('input');
            }
        });
    }

    private readonly sendTopicService = inject(SendTopicService);

    onPublish(finalData: any) {
        this.sendTopicService.currentTopic.patchValue({
            headline: finalData.title,
            description: finalData.description,
            category: finalData.category,
            icon: finalData.icon,
            picture: finalData.picture,
            keywords: finalData.tags
        });

        this.sendTopicService.markAsReadyForPreview();
        this.router.navigate([AppRoutes.User.Topic.PREVIEW]);
    }

    onRegenerate() {
        const input = this.originalInput || this.polishData(); // Use available data
        if (!input) return;

        // Ideally we should have a loading state for just the image, but for now we can rely on variable binding
        // or add a specific loading signal.

        this.contentAssistHelper.generatePictures({
            title: input.title,
            description: input.description,
            inferCoverImage: true,
            inferPhotoIcon: false, // Don't wipe out icons if we just want cover? Or maybe user wants all new?
            inferSymbolicIcon: false
        }).subscribe({
            next: (newPictures) => {
                // Update only the cover image in the data
                this.polishData.update(current => ({
                    ...current,
                    coverImage: newPictures.imageUrl
                }));

                // Show success?
                this.notificationService.success('Cover image regenerated!');
            },
            error: (err) => {
                this.notificationService.error('Failed to regenerate image.');
            }
        });
    }

    onBackToEdit() {
        this.currentStep.set('input');
    }
}
