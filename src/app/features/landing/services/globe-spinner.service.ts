import mapboxgl from "mapbox-gl";

export class GlobeSpinnerService {
    private map: mapboxgl.Map | null = null;
    private spinEnabled = false;
    private userInteracting = false;
    public spinning = false;
    public initialized = false;
    public readonly maxSpinZoom = 4;
    private readonly slowSpinZoom = 3;
    private readonly secondsPerRevolution = 240;

    public init(map: mapboxgl.Map) {
        this.map = map;

        const onUserInteractionStart = () => {
            this.userInteracting = true;
        };

        const onUserInteractionEnd = () => {
            this.userInteracting = false;
            this.spinGlobe();
        };

        map.on("mousedown", onUserInteractionStart);
        map.on("touchstart", onUserInteractionStart);

        map.on("mouseup", onUserInteractionEnd);
        map.on("touchend", onUserInteractionEnd);

        map.on("dragend", onUserInteractionEnd);
        map.on("pitchend", onUserInteractionEnd);
        map.on("rotateend", onUserInteractionEnd);
        map.on("moveend", () => this.spinGlobe());
    }

    public start() {
        this.spinEnabled = true;
        this.spinning = true;
        this.spinGlobe();
    }

    public stop() {
        this.spinEnabled = false;
        this.spinning = false;
    }

    public toggle() {
        this.spinEnabled = !this.spinEnabled;
        if (this.spinEnabled) {
            this.start();
        } else {
            this.stop();
        }
    }

    private spinGlobe() {
        if (!this.map || !this.spinEnabled || this.userInteracting) return;

        const zoom = this.map.getZoom();

        if (zoom >= this.maxSpinZoom) {
            this.spinning = false;
            return
        };

        let distancePerSecond = 360 / this.secondsPerRevolution;

        if (zoom > this.slowSpinZoom) {
            const zoomDif = (this.maxSpinZoom - zoom) / (this.maxSpinZoom - this.slowSpinZoom);
            distancePerSecond *= zoomDif;
        }

        const center = this.map.getCenter();
        center.lng -= distancePerSecond;

        this.map.easeTo({
            center,
            duration: 500,
            easing: (n) => n,
        });
    }
}
