import { BannerStrategy } from "../../interfaces/banner/banner-strategy";

export class BannerContext {
    private strategy: BannerStrategy;

    constructor(strategy: BannerStrategy) {
        this.strategy = strategy;
    }

    public setStrategy(strategy: BannerStrategy) {
        this.strategy = strategy;
    }

    public async generate(): Promise<string | null> {
        try {
            return await this.strategy.generateBanner();
        } catch (error) {
            console.error("BannerContext: Error generating banner:", error);
            return null;
        }
    }
}
