export interface MapboxFeatureCollection {
    type: "FeatureCollection";
    features: MapboxFeature[];
    attribution?: string;
}

export interface MapboxFeature {
    type: "Feature";
    id: string;
    geometry: Geometry;
    properties: FeatureProperties;
    place_type?: string[];
    place_name?: string;
    name?: string;
    text?: string;
}

export interface Geometry {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
}

export interface FeatureProperties {
    mapbox_id: string;
    feature_type: "place" | "district" | "region" | "country";
    full_address: string;
    name: string;
    name_preferred: string;
    coordinates: Coordinates;
    place_formatted: string;
    bbox: [number, number, number, number]; // [minX, minY, maxX, maxY]
    context: FeatureContext;
}

export interface Coordinates {
    longitude: number;
    latitude: number;
}

export interface FeatureContext {
    region?: RegionContext;
    district?: DistrictContext;
    country?: CountryContext;
    place?: PlaceContext;
    locality?: LocalityContext;
}

export interface RegionContext {
    mapbox_id: string;
    name: string;
    wikidata_id: string;
    region_code: string;
    region_code_full: string;
}

export interface DistrictContext {
    mapbox_id: string;
    name: string;
    wikidata_id: string;
}

export interface CountryContext {
    mapbox_id: string;
    name: string;
    wikidata_id: string;
    country_code: string;
    country_code_alpha_3: string;
}

export interface PlaceContext {
    mapbox_id: string;
    name: string;
    wikidata_id: string;
}

export interface LocalityContext {
    mapbox_id: string;
    name: string;
    wikidata_id: string;
}
