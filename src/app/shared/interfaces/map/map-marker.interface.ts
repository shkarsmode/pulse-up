export interface IMapMarker {
  id: number;
  topicId: number;
  h3Index: string;
  lng: number;
  lat: number;
  icon: string;
}

export interface IMapMarkerAnimated extends IMapMarker {
  delay: number;
}
export interface IMapMarkerVisibilityEventData extends IMapMarker {
  isVisible: boolean;
}