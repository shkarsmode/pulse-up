import { Component, ElementRef, inject, ViewChild, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { filter, map, take } from "rxjs";
import { SendTopicService } from "@/app/shared/services/core/send-topic.service";
import { ProfileService } from "@/app/shared/services/profile/profile.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { isErrorWithMessage } from "@/app/shared/helpers/errors/is-error-with-message";
import { VotingService } from "@/app/shared/services/core/voting.service";

@Component({
    selector: "app-topic-preview",
    templateUrl: "./topic-preview.component.html",
    styleUrl: "./topic-preview.component.scss",
})
export class TopicPreviewComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly location = inject(Location);
    private readonly profileService = inject(ProfileService);
    private readonly votingService = inject(VotingService);
    private readonly sendTopicService = inject(SendTopicService);
    private readonly notificationService = inject(NotificationService);

    @ViewChild("description", { static: false }) descriptionRef: ElementRef<HTMLDivElement>;

    profile$ = this.profileService.profile$.pipe(filter((profile) => !!profile));
    name$ = this.profile$.pipe(map((profile) => profile.name));
    icon: string | ArrayBuffer | null;
    picture: string | ArrayBuffer | null;
    topicData = this.sendTopicService.getFormValues();
    title = this.topicData.headline;
    longDescription = this.topicData.description;
    shortDescription = this.longDescription.replace(/\n/g, " ");
    keywords = this.topicData.keywords;
    isReadMore = false;
    isReadyForPreview = this.sendTopicService.isTopicReadyForPreview;
    isSubmitting = this.sendTopicService.submitting.asObservable();
    customLocationCoordinates = this.sendTopicService.customLocation
        ? {
              lng: this.sendTopicService.customLocation.lng,
              lat: this.sendTopicService.customLocation.lat,
          }
        : null;
    customLocationName = this.sendTopicService.customLocation?.fullname || "";

    constructor() {
        if (!this.isReadyForPreview) {
            this.location.back();
        }
    }

    ngOnInit(): void {
        this.readFiles();
        this.determineIfNeedToRemoveShowMoreButton();
    }

    onReadMore(): void {
        this.isReadMore = true;
    }

    onPublish() {
        this.sendTopicService.createTopic().pipe(
            take(1),
            filter((result) => !!result),
        ).subscribe({
            next: (topic) => {
                this.votingService.shouldVoteAutomatically = true;
                this.router.navigateByUrl(`/topic/${topic.id}`);
            },
            error: (error: unknown) => {
                if (isErrorWithMessage(error)) {
                    this.notificationService.error(error.message);
                } else {
                    this.notificationService.error("Failed to create topic. Please try again.");
                }
            },
        });
    }

    onEdit() {
        this.location.back();
    }

    private readFiles(): void {
        if (this.topicData.icon) {
            const iconReader = new FileReader();
            iconReader.onload = () => {
                this.icon = iconReader.result;
            };
            iconReader.readAsDataURL(this.topicData.icon);
        }

        if (this.topicData.picture) {
            const pictureReader = new FileReader();
            pictureReader.onload = () => {
                this.picture = pictureReader.result;
            };
            pictureReader.readAsDataURL(this.topicData.picture);
        }
    }

    private determineIfNeedToRemoveShowMoreButton(): void {
        setTimeout(() => {
            const textElement = this.descriptionRef.nativeElement;

            const fullHeight = textElement!.scrollHeight;
            const visibleHeight = textElement!.clientHeight + 2;
            const heightDiff = fullHeight - visibleHeight;
            const isTruncated = heightDiff > 19;
            this.isReadMore = !isTruncated;
        }, 100);
    }
}
