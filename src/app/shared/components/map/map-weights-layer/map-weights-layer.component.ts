import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { HeatmapService } from "@/app/shared/services/map/heatmap.service";
import { WINDOW } from '@/app/shared/tokens/window.token';
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input, OnDestroy } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgxMapboxGLModule } from "ngx-mapbox-gl";

@Component({
    selector: "app-map-weights-layer",
    standalone: true,
    imports: [CommonModule, NgxMapboxGLModule, FormatNumberPipe],
    templateUrl: "./map-weights-layer.component.html",
    styleUrl: "./map-weights-layer.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapWeightsLayerComponent implements OnDestroy {
    public isWin = inject(WINDOW);
    private destroyRef = inject(DestroyRef);
    private heatmapService = inject(HeatmapService);

    @Input() public map: mapboxgl.Map;
    @Input() topicId: number;

    public weights$ = this.heatmapService.weights$.pipe(takeUntilDestroyed(this.destroyRef));

    ngOnDestroy() {
        this.heatmapService.clearWeights();
    }
}
