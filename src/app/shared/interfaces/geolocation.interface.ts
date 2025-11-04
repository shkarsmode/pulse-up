import { TopicLocation } from "@/app/features/user/interfaces/topic-location.interface";

export interface IGeolocationPosition {
    coords: IGeolocationPositionCoords;
}

export interface IGeolocationPositionCoords {
    accuracy: number;
    latitude: number;
    longitude: number;
}

export interface IGeolocation {
    geolocationPosition: IGeolocationPosition;
    details: TopicLocation;
    fallback?: boolean;
}
