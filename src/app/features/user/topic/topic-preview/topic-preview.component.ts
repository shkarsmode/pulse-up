import { Component, ElementRef, inject, ViewChild } from "@angular/core";
import { Location } from "@angular/common";
import { AppConstants } from "@/app/shared/constants";
import { filter, map } from "rxjs";
import { SendTopicService } from "@/app/shared/services/core/send-topic.service";
import { ProfileStore } from "@/app/shared/stores/profile.store";

@Component({
    selector: "app-topic-preview",
    templateUrl: "./topic-preview.component.html",
    styleUrl: "./topic-preview.component.scss",
})
export class TopicPreviewComponent {
    private readonly location = inject(Location);
    private profileStore = inject(ProfileStore);
    private readonly sendTopicService = inject(SendTopicService);

    @ViewChild("description", { static: false }) descriptionRef: ElementRef<HTMLDivElement>;

    profile$ = this.profileStore.profile$.pipe(filter((profile) => !!profile));
    name$ = this.profile$.pipe(map((profile) => profile.name));
    icon: string | ArrayBuffer | null;
    picture: string | ArrayBuffer | null;
    topicData = this.sendTopicService.getFormValues();
    title = this.topicData.headline;
    longDescription = this.topicData.description;
    shortDescription = this.longDescription.replace(/\n/g, " ");
    keywords = this.topicData.keywords;
    isReadMore: boolean = false;
    isReadyForPreview = this.sendTopicService.isTopicReadyForPreview;
    isSubmitting = this.sendTopicService.submitting.asObservable();
    customLocationCoordinates = {
        lng:
            this.sendTopicService.customLocation?.lng ||
            AppConstants.DEFAULT_USER_LOCATION.longitude,
        lat:
            this.sendTopicService.customLocation?.lat ||
            AppConstants.DEFAULT_USER_LOCATION.latitude,
    };
    customLocationName = this.sendTopicService.customLocation
        ? [
              this.sendTopicService.customLocation.city,
              this.sendTopicService.customLocation.state,
              this.sendTopicService.customLocation.country,
          ]
              .filter(Boolean)
              .join(", ")
        : "";

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
        this.sendTopicService.createTopic();
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
