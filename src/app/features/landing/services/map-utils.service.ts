import mapboxgl from "mapbox-gl";
import * as h3 from "h3-js";
import { MapBounds } from "../helpers/interfaces/map-bounds.interface";

export class MapUtils {
    // TODO: Remove method
    public static addGeoJsonSource({
        map,
        id,
        data,
    }: {
        map: mapboxgl.Map;
        id: string;
        data: GeoJSON.FeatureCollection;
    }) {
        map.addSource(id, {
            type: "geojson",
            data: data,
        });
    }

    // TODO: Remove method
    public static addFillLayer({
        map,
        layerId,
        sourceId,
        data,
    }: {
        map: mapboxgl.Map;
        layerId: string;
        sourceId: string;
        data: mapboxgl.FillPaint;
    }) {
        map.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            layout: {},
            paint: data,
        });
    }

    // TODO: Remove method
    public static addLineLayer({
        map,
        layerId,
        sourceId,
        data,
    }: {
        map: mapboxgl.Map;
        layerId: string;
        sourceId: string;
        data: mapboxgl.LinePaint;
    }) {
        map.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            layout: {},
            paint: data,
        });
    }

    public static addHeatmapLayer({
        map,
        layerId,
        sourceId,
        data,
    }: {
        map: mapboxgl.Map;
        layerId: string;
        sourceId: string;
        data: mapboxgl.HeatmapPaint;
    }) {
        map.addLayer({
            id: layerId,
            type: "heatmap",
            source: sourceId,
            paint: data,
        });
    }

    // TODO: Remove method
    public static updatePaintProperty({
        map,
        layerId,
        property,
        value,
    }: {
        map: mapboxgl.Map;
        layerId: string;
        property: string;
        value: unknown;
    }) {
        map.setPaintProperty(layerId, property, value);
    }

    // TODO: Remove method
    public static setSourceData({
        map,
        sourceId,
        data,
    }: {
        map: mapboxgl.Map;
        sourceId: string;
        data: string | GeoJSON.FeatureCollection | GeoJSON.Feature;
    }) {
        const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
        if (source) {
            source.setData(data);
        }
    }

    public static getResolutionLevel({
        map,
        resolutionLevelsByZoom,
    }: {
        map: mapboxgl.Map;
        resolutionLevelsByZoom: Record<number, number>;
    }): number {
        const zoom = map.getZoom();
        if (zoom === undefined || zoom === null) return 7;

        let resolution = 7;
        const zoomLevels = Object.keys(resolutionLevelsByZoom)
            .map(Number)
            .sort((a, b) => a - b);
        for (const level of zoomLevels) {
            if (zoom >= level) {
                resolution = resolutionLevelsByZoom[level];
            } else {
                break;
            }
        }

        return resolution;
    }

    public static isHexagonCrossesAntimeridian(h3Index: string) {
        const boundary = h3.h3ToGeoBoundary(h3Index, true);

        let crosses = false;
        for (let i = 0; i < boundary.length - 1; i++) {
            const lon1 = boundary[i][0];
            const lon2 = boundary[i + 1][0];

            if (Math.abs(lon1 - lon2) > 180) {
                crosses = true;
                break;
            }
        }

        return crosses;
    }

    public static getMapBounds({ map, global = false }: { map: mapboxgl.Map, global?: boolean }): MapBounds {
        if (!map || global) return {
            ne: { lat: 90, lng: 180 },
            sw: { lat: -90, lng: -180 },
        };
        const bounds = map.getBounds();
        return {
            ne: {
                lat: Math.min(bounds.getNorthEast().lat, 90),
                lng: Math.min(bounds.getNorthEast().lng, 180),
            },
            sw: {
                lat: Math.max(bounds.getSouthWest().lat, -90),
                lng: Math.max(bounds.getSouthWest().lng, -180),
            },
        };
    }
}
