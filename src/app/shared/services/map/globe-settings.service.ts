import { Injectable, signal } from '@angular/core';
import mapboxgl from 'mapbox-gl';

export type GlowState = 0 | 1 | 2 | 3;

@Injectable({
    providedIn: 'root',
})
export class GlobeSettingsService {
    // 0 = off, 1 = minimal, 2 = medium, 3 = strong
    public glowState = signal<GlowState>(1);

    // Heatmap settings
    public heatmapIntensity = signal<number>(0.1);  // Default matched runtime component value (was 0.35 in constants but overridden to 0.1)
    public heatmapOpacity = signal<number>(0.45);   // Default max opacity
    public heatmapRadius = signal<number>(100);     // Default base radius

    public toggleGlowState() {
        // Cycle through states: 0 -> 1 -> 2 -> 3 -> 0
        const nextState = ((this.glowState() + 1) % 4) as GlowState;
        this.glowState.set(nextState);
        console.log('GlobeSettingsService: Toggled state to', nextState);
    }

    public getGlowStateLabel(): string {
        switch (this.glowState()) {
            case 0:
                return 'Off';
            case 1:
                return '1';
            case 2:
                return '2';
            case 3:
                return '3';
        }
    }

    public getFogForState(state: GlowState): mapboxgl.Fog {
        const baseColor = 'rgb(186, 210, 235)';
        const highColor = 'rgb(50, 90, 140)';
        const spaceColor = 'rgb(2, 11, 27)';

        switch (state) {
            case 0: // Off - no glow
                return {
                    color: spaceColor,
                    'high-color': spaceColor,
                    'space-color': spaceColor,
                    'star-intensity': 0,
                    'horizon-blend': 0,
                };
            case 1: // Minimal glow
                return {
                    color: baseColor,
                    'high-color': highColor,
                    'space-color': spaceColor,
                    'star-intensity': 0,
                    'horizon-blend': 0.005,
                };
            case 2: // Medium glow
                return {
                    color: 'rgb(200, 220, 240)',
                    'high-color': 'rgb(80, 130, 200)',
                    'space-color': spaceColor,
                    'star-intensity': 0,
                    'horizon-blend': 0.02,
                };
            case 3: // Strong glow
                return {
                    color: 'rgb(228, 240, 255)',
                    'high-color': 'rgb(117, 172, 255)',
                    'space-color': spaceColor,
                    'star-intensity': 0,
                    'horizon-blend': 0.04,
                };
        }
    }
}
