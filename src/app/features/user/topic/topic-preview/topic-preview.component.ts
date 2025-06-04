import { Component, ElementRef, inject, ViewChild } from "@angular/core";
import { SendTopicService } from "@/app/shared/services/core/send-topic.service";
import { UserStore } from "@/app/shared/stores/user.store";
import { Location } from "@angular/common";
import { AppConstants } from "@/app/shared/constants";

@Component({
    selector: "app-topic-preview",
    templateUrl: "./topic-preview.component.html",
    styleUrl: "./topic-preview.component.scss",
})
export class TopicPreviewComponent {
    private readonly location = inject(Location);
    private readonly userStore = inject(UserStore);
    private readonly sendTopicService = inject(SendTopicService);

    @ViewChild("description", { static: false }) descriptionRef: ElementRef<HTMLDivElement>;

    name: string = "";
    username: string = "";
    icon: string | ArrayBuffer | null;
    picture: string | ArrayBuffer | null;
    topicData = this.sendTopicService.getFormValues();
    title = this.topicData.headline;
    longDescription = this.topicData.description;
    shortDescription = this.longDescription.replace(/\n/g, " ");
    keywords = this.topicData.keywords;
    profile$ = this.userStore.profile$;
    isReadMore: boolean = false;
    isReadyForPreview = this.sendTopicService.isTopicReadyForPreview;
    isSubmitting = this.sendTopicService.submitting.asObservable();
    customLocationCoordinates = {
        lng: this.sendTopicService.customLocation?.lng || AppConstants.DEFAULT_USER_LOCATION.longitude,
        lat: this.sendTopicService.customLocation?.lat || AppConstants.DEFAULT_USER_LOCATION.latitude,
    };
    customLocationName = this.sendTopicService.customLocation
        ? [
              this.sendTopicService.customLocation.country,
              this.sendTopicService.customLocation.state,
              this.sendTopicService.customLocation.city,
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
        this.updateName();
        this.updateUsername();
        this.readFiles();
        this.determineIfNeedToRemoveShowMoreButton();
    }

    onReadMore(): void {
        this.isReadMore = true;
    }

    onPublish() {
        this.sendTopicService.createTopic();
    }

    private updateUsername(): void {
        this.profile$.subscribe((profile) => {
            if (profile) {
                this.username = profile.username;
            }
        });
    }

    private updateName(): void {
        this.profile$.subscribe((profile) => {
            if (profile) {
                this.name = profile.name;
            }
        });
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
