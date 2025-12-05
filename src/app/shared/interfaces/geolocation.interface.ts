import { TopicLocation } from "@/app/features/user/interfaces/topic-location.interface";
import { LocationSource } from '../enums/location-source.enum';

export interface IGeolocationPosition {
    coords: IGeolocationPositionCoords;
}

export interface IGeolocationPositionCoords {
    accuracy?: number;
    latitude: number;
    longitude: number;
}

export interface IGeolocation {
    geolocationPosition: IGeolocationPosition;
    details: TopicLocation;
    fallback?: boolean;
    locationSource?: LocationSource;
}
