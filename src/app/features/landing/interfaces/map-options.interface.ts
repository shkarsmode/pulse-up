import mapboxgl from "mapbox-gl";

export interface IMapOptions {
    rounded?: boolean;
    preview?: boolean;
    zoom?: [number];
    minZoom?: number;
    maxBounds?: mapboxgl.LngLatBoundsLike | undefined;
    center?: [number, number];
    scrollZoom?: boolean;
    doubleClickZoom?: boolean;
    projection?: mapboxgl.Projection["name"];
}
