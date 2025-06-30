export class MapPainter {
    private map: mapboxgl.Map;
    private sourceId: string;

    constructor({ map, sourceId }: { map: mapboxgl.Map; sourceId: string }) {
        this.map = map;
        this.sourceId = sourceId;
    }

    addGeoJsonSource(data: GeoJSON.FeatureCollection) {
        this.map.addSource(this.sourceId, {
            type: "geojson",
            data: data,
        });
    }

    setSourceData(data: any) {
        const source = this.map.getSource(this.sourceId) as mapboxgl.GeoJSONSource;
        if (source) {
            source.setData(data);
        }
    }

    addFillLayer({ layerId, data }: { layerId: string; data: mapboxgl.FillPaint }) {
        this.map.addLayer({
            id: layerId,
            type: "fill",
            source: this.sourceId,
            layout: {},
            paint: data,
        });
    }

    addLineLayer({ layerId, data }: { layerId: string; data: mapboxgl.LinePaint }) {
        this.map.addLayer({
            id: layerId,
            type: "line",
            source: this.sourceId,
            layout: {},
            paint: data,
        });
    }

    updatePaintProperty({
        layerId,
        property,
        value,
    }: {
        layerId: string;
        property: string;
        value: any;
    }) {
        this.map.setPaintProperty(layerId, property, value);
    }
}
