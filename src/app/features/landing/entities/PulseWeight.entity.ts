export class PulseWeight {
    value: number;
    lat: number;
    lng: number;
    h3index: string;

    constructor({
        lat,
        lng,
        h3index,
        value,
    }: {
        value: number;
        lat: number;
        lng: number;
        h3index: string;
    }) {
        this.value = value;
        this.lat = lat;
        this.lng = lng;
        this.h3index = h3index;
    }
}
