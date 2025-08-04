export interface IHeatmapData
    extends Array<{
        coords: number[];
        value: number;
        h3Index: string;
    }> {}
