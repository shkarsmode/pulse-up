export class GeolocationUtils {
    public static getLocationFullname({
        country,
        state,
        city,
    }: {
        country: string;
        state?: string;
        city?: string;
    }): string {
        return [city, state, country].filter(Boolean).join(", ");
    }
}
