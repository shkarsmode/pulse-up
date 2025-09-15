import { inject, Injectable, signal } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { TopicQRCodePopupData } from "@/app/features/landing/interfaces/topic-qrcode-popup-data.interface";

@Injectable({
    providedIn: "root",
})
export class QrcodePopupService {
    private readonly sanitizer = inject(DomSanitizer);

    private qrCodeDownloadLink = signal<SafeUrl>("");
    private qrCodeImageBlob = signal<Blob | null>(null);

    public downloadBannerLink = this.qrCodeDownloadLink.asReadonly();
    public bannerImageBlob = this.qrCodeImageBlob.asReadonly();

    public async generateBanner(url: string, topicData: TopicQRCodePopupData) {
        const objectUrl = this.sanitizer.sanitize(4, url);

        if (!objectUrl) return;

        const [{ TopicBannerGenerator }, { BannerContext }] = await Promise.all([
            import("@/app/shared/services/banner-generator/strategies/topic-banner-generator"),
            import("@/app/shared/services/banner-generator/banner-context"),
        ]);

        const context = new BannerContext(
            new TopicBannerGenerator({
                icon: topicData.banner.icon,
                title: topicData.banner.title,
                description:
                    topicData.banner.subtitle,
                qrCode: objectUrl,
            }),
        );
        const finalUrl = await context.generate();

        if (!finalUrl) return;

        this.qrCodeDownloadLink.set(this.sanitizer.bypassSecurityTrustUrl(finalUrl));
        this.qrCodeImageBlob.set(this.dataURLToBlob(finalUrl));
    }

    private dataURLToBlob(dataURL: string): Blob {
        const [header, base64] = dataURL.split(",");
        const mime = header.match(/:(.*?);/)![1];
        const byteString = atob(base64);
        const array = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([array], { type: mime });
        return blob;
    }
}
