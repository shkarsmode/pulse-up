import { TopicLocation } from "@/app/features/user/interfaces/topic-location.interface";

export interface IGeolocation {
    geolocationPosition: GeolocationPosition;
    details: TopicLocation;
}