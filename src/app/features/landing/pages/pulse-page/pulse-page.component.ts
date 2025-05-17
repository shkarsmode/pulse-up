import { Component, ElementRef, inject, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, ParamMap, Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { catchError, first, Observable, of } from "rxjs";
import { SvgIconComponent } from "angular-svg-icon";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { IPulse } from "@/app/shared/interfaces";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { MetadataService } from "@/app/shared/services/core/metadata.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { FadeInDirective } from "@/app/shared/animations/fade-in.directive";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { MapComponent } from "../../components/map/map.component";
import { SliderComponent } from "@/app/shared/components/slider/slider.component";
import { TopPulseCardComponent } from "@/app/shared/components/pulses/top-pulse/top-pulse-card.component";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { LoadImgPathDirective } from "@/app/shared/directives/load-img-path/load-img-path.directive";
import { FlatButtonDirective } from "@/app/shared/components/ui-kit/buttons/flat-button/flat-button.directive";

@Component({
    selector: "app-pulse-page",
    templateUrl: "./pulse-page.component.html",
    styleUrl: "./pulse-page.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        SvgIconComponent,
        PrimaryButtonComponent,
        MenuComponent,
        CopyButtonComponent,
        SocialsButtonComponent,
        MapComponent,
        SliderComponent,
        TopPulseCardComponent,
        SpinnerComponent,
        FadeInDirective,
        FormatNumberPipe,
        LoadImgPathDirective,
        FlatButtonDirective,
    ],
})
export class PulsePageComponent implements OnInit {
    public pulse: IPulse | null = null;
    public isReadMore: boolean = false;
    public isLoading: boolean = true;
    public suggestions: IPulse[] = [];
    public pulseUrl: string = "";
    public shortPulseDescription: string = "";

    @ViewChild("description", { static: false })
    public description: ElementRef<HTMLDivElement>;

    private readonly router: Router = inject(Router);
    private readonly route: ActivatedRoute = inject(ActivatedRoute);
    private readonly pulseService: PulseService = inject(PulseService);
    private readonly metadataService: MetadataService = inject(MetadataService);
    private readonly settingsService: SettingsService = inject(SettingsService);

    public ngOnInit(): void {
        this.initPulseUrlIdListener();
    }

    public onReadMore(): void {
        this.isReadMore = true;
    }

    public onCopyLink(event: MouseEvent) {
        event.stopPropagation();
    }

    private initPulseUrlIdListener(): void {
        this.route.paramMap.subscribe(this.handlePulseUrlIdListener.bind(this));
    }

    private handlePulseUrlIdListener(data: ParamMap): void {
        const id = data.get("id")!;
        this.pulse = null;
        this.isLoading = true;
        const pulse = this.getPulseById(id);
        pulse.subscribe((pulse) => {
            this.shortPulseDescription = pulse.description.replace(/\n/g, " ");
            this.pulse = pulse;
            this.isLoading = false;
            this.determineIfNeedToRemoveShowMoreButton();
            this.createLink(pulse.description);
            this.updateSuggestions();
            this.pulseUrl = this.settingsService.shareTopicBaseUrl + pulse.shareKey;
            this.metadataService.setTitle(`${pulse.title} | Support What Matters – Pulse Up`);
            this.metadataService.setMetaTag(
                "description",
                `Support '${pulse.title}' anonymously and see how it’s trending in real time across the map. Track public sentiment and join the pulse.`,
            );
        });
    }

    private getPulseById(id: string | number) {
        return this.pulseService.getById(id).pipe(
            first(),
            catchError((error) => {
                this.router.navigateByUrl("/" + AppRoutes.Community.INVALID_LINK);
                return of(error);
            }),
        ) as Observable<IPulse>;
    }

    private determineIfNeedToRemoveShowMoreButton(): void {
        setTimeout(() => {
            const textElement = this.description.nativeElement;

            const fullHeight = textElement!.scrollHeight;
            const visibleHeight = textElement!.clientHeight + 2;
            const heightDiff = fullHeight - visibleHeight;
            const isTruncated = heightDiff > 19;
            this.isReadMore = !isTruncated;
        }, 100);
    }

    private updateSuggestions(): void {
        this.pulseService
            .get()
            .pipe(first())
            .subscribe((pulses) => {
                const category = this.pulse?.category;
                const sameCategoryTopics = pulses
                    .filter((pulse) => pulse.category === category)
                    .filter((pulse) => pulse.id !== this.pulse?.id);
                this.suggestions =
                    category && sameCategoryTopics.length
                        ? sameCategoryTopics.slice(0, 3)
                        : pulses.slice(0, 3);
            });
    }

    private createLink(value: string): void {
        let link = this.extractUrl(value);

        if (!link || !this.pulse) return;

        this.pulse.description = value.replace(link, "");

        this.pulse.description =
            this.pulse.description + `<a href="${link}" rel="nofollow" target="_blank">${link}</a>`;
    }

    private extractUrl(value: string): string | null {
        // Regular expression to match URLs (basic version)
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = value.match(urlRegex);

        // If there's a match, return the first URL, otherwise return null
        return match ? match[0] : null;
    }
}
