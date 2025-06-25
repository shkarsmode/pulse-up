import { Component, ElementRef, inject, ViewChild } from "@angular/core";
import { Location } from "@angular/common";
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
        this.sendTopicService.createTopic();
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
