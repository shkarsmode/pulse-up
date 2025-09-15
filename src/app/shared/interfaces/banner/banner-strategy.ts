export interface BannerStrategy {
    generateBanner(): Promise<string>;
}
