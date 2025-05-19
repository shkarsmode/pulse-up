import { EventData, MapStyleDataEvent } from "mapbox-gl";

export interface IMapStyleDataEvent extends MapStyleDataEvent, EventData {}
