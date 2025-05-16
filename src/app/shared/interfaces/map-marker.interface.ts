export interface IMapMarker {
  topicId: string;
  h3Index: string;
  lng: number;
  lat: number;
  icon: string;
}

export interface IMapMarkerAnimated extends IMapMarker {
  delay: number;
}