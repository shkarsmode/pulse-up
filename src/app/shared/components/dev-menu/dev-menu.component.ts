import { TopicService } from "@/app/features/landing/pages/topic/topic.service";
import { environment } from "@/environments/environment";
import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSliderModule } from "@angular/material/slider";
import { DevSettingsService } from "../../services/core/dev-settings.service";
import { GlobeSettingsService } from "../../services/map/globe-settings.service";

@Component({
    selector: "app-dev-menu",
    standalone: true,
    imports: [
        CommonModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatLabel,
        MatExpansionModule,
        MatButtonModule,
        MatSliderModule,
        MatSlideToggleModule,
    ],
    templateUrl: "./dev-menu.component.html",
    styleUrls: ["./dev-menu.component.scss"],
})
export class DevMenuComponent {
    private readonly formBuilder = inject(FormBuilder);
    public readonly devSettings = inject(DevSettingsService);
    public readonly globeSettings = inject(GlobeSettingsService);
    private readonly topicService = inject(TopicService);

    public locationForm: FormGroup;
    public campaignJson = new FormControl<string>('');
    readonly isOpen = signal(false);

    constructor() {
        const lat = 35.167406;
        const lng = 33.435499;
        this.locationForm = this.formBuilder.group({
            lat: [lat],
            lng: [lng],
            accuracy: ["100"],
        });

        // Prefill campaign JSON from current topic when available
        const topic = this.topicService.topic();
        if (topic?.campaign) {
            this.campaignJson.setValue(JSON.stringify(topic.campaign, null, 2));
        } else {
            this.campaignJson.setValue(this.sampleCampaignJson("active"));
        }
    }

    private ensureOverride() {
        if (!this.devSettings.markerSizingOverride) {
            this.devSettings.markerSizingOverride = { globe: {}, mercator: {} };
        }
    }

    getSizingValue(isGlobe: boolean, key: keyof (typeof environment.markerSizing.globe)) {
        const side = isGlobe ? "globe" : "mercator";
        const override = this.devSettings.markerSizingOverride?.[side as "globe" | "mercator"] as any;
        if (override && typeof override[key] !== "undefined") return override[key];
        return (environment.markerSizing as any)[side][key];
    }

    setSizingValue(isGlobe: boolean, key: keyof (typeof environment.markerSizing.globe), value: number) {
        this.ensureOverride();
        const side = isGlobe ? "globe" : "mercator";
        const cur = this.devSettings.markerSizingOverride || { globe: {}, mercator: {} };
        // @ts-ignore
        const part = { ...(cur as any)[side] } || {};
        part[key] = Number(value);
        (cur as any)[side] = part;
        this.devSettings.markerSizingOverride = cur;
    }

    toggleMenu() {
        this.isOpen.update((value) => !value);
    }

    applyCampaignOverrideFromJson() {
        const raw = this.campaignJson.value || '';
        try {
            const obj = JSON.parse(raw);
            // Create realistic stats based on goal for demo
            const stats = obj ? this.generateRealisticStats(obj) : null;
            if (obj && stats) {
                this.topicService.setCampaignAndStatsOverride(obj, stats);
            } else {
                this.topicService.setCampaignOverride(null as any);
            }
        } catch (e) {
            console.error('[DevMenu] Invalid campaign JSON', e);
            alert('Invalid campaign JSON');
        }
    }

    clearCampaignOverride() {
        this.topicService.setCampaignOverride(null as any);
    }

    private generateRealisticStats(campaign: any): any {
        if (!campaign || !campaign.goals || !campaign.goals.length) {
            return { totalVotes: 0, totalUniqueUsers: 0, lastDayVotes: 0 };
        }
        
        const currentGoalIndex = campaign.accomplishedGoals?.length || 0;
        // For completed state, show stats of the last goal
        const goalIndex = currentGoalIndex >= campaign.goals.length 
            ? campaign.goals.length - 1 
            : currentGoalIndex;
        
        const currentGoal = campaign.goals[goalIndex];
        
        // Generate stats that are 50-70% of the goal for demo purposes
        let stats: any = { totalVotes: 0, totalUniqueUsers: 0, lastDayVotes: 0 };
        
        if (currentGoal.supporters) {
            stats.totalUniqueUsers = Math.round(currentGoal.supporters * 0.57); // 57% like in screenshot
        } else if (currentGoal.lifetimeVotes) {
            stats.totalVotes = Math.round(currentGoal.lifetimeVotes * 0.57);
        } else if (currentGoal.dailyVotes) {
            stats.lastDayVotes = Math.round(currentGoal.dailyVotes * 0.57);
        }
        
        return stats;
    }

    /** quick presets */
    setPreset(state: 'no_goal'|'not_started'|'active'|'completed_success'|'completed_fail') {
        this.campaignJson.setValue(this.sampleCampaignJson(state));
    }

    private sampleCampaignJson(state: 'no_goal'|'not_started'|'active'|'completed_success'|'completed_fail'): string {
        if (state === 'no_goal') return 'null';
        const now = new Date();
        const addDays = (d: number) => new Date(now.getTime() + d*86400000).toISOString();
        let startsAt = addDays(-1);
        let endsAt = addDays(60);
        
        const goals = [
            { reward: '$100 donation to U24', supporters: 20 },
            { reward: '$200 donation to U24', lifetimeVotes: 50 },
            { reward: '$500 donation', dailyVotes: 150 }
        ];
        
        let accomplishedGoals: string[] = [];
        
        if (state === 'not_started') {
            startsAt = addDays(30);
            endsAt = addDays(90);
            accomplishedGoals = [];
        } else if (state === 'active') {
            // 1 goal accomplished out of 3
            accomplishedGoals = [addDays(-5)];
        } else if (state === 'completed_success') {
            // All goals accomplished
            accomplishedGoals = [addDays(-20), addDays(-10), addDays(-1)];
            endsAt = addDays(1);
        } else if (state === 'completed_fail') {
            // Campaign ended but not all goals accomplished
            startsAt = addDays(-90);
            endsAt = addDays(-1);
            accomplishedGoals = [addDays(-50)]; // 1 out of 3
        }
        
        const sample = {
            id: 'dev-override',
            createdAt: now.toISOString(),
            description: 'Help us reach our goals!',
            startsAt,
            endsAt,
            sponsorLink: 'https://example.com',
            sponsorLogo: 'https://link.pulseup.com/assets/pulseup-black.png',
            sponsoredBy: 'PulseUp!',
            goals,
            accomplishedGoals,
        };
        return JSON.stringify(sample, null, 2);
    }
    save() {
        this.devSettings.mockLocation = {
            latitude: parseFloat(this.locationForm.value.lat || "0"),
            longitude: parseFloat(this.locationForm.value.lng || "0"),
            accuracy: parseFloat(this.locationForm.value.accuracy || "100"),
        };
        this.toggleMenu();
    }

    setAccentColor(hex: string) {
        this.applyAccentToDocument(hex);
    }

    resetAccentColor() {
        const root = document.documentElement;
        root.style.removeProperty("--accent-color");
        root.style.removeProperty("--accent-foreground");
        root.classList.remove("dev-accent-override");
    }

    private applyAccentToDocument(hex: string) {
        const root = document.documentElement;
        const fg = this.getReadableForeground(hex);
        root.style.setProperty("--accent-color", hex);
        root.style.setProperty("--accent-foreground", fg);
        root.classList.add("dev-accent-override");
    }

    private getReadableForeground(hex: string) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return "#ffffff";
        const lum = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
        return lum > 0.5 ? "#000000" : "#ffffff";
    }

    private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        const sanitized = hex.replace('#', '').trim();
        if (sanitized.length === 3) {
            const r = parseInt(sanitized[0] + sanitized[0], 16);
            const g = parseInt(sanitized[1] + sanitized[1], 16);
            const b = parseInt(sanitized[2] + sanitized[2], 16);
            return { r, g, b };
        }
        if (sanitized.length === 6) {
            const r = parseInt(sanitized.substring(0, 2), 16);
            const g = parseInt(sanitized.substring(2, 4), 16);
            const b = parseInt(sanitized.substring(4, 6), 16);
            return { r, g, b };
        }
        return null;
    }
}
