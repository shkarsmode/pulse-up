import { inject, Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Injectable({
    providedIn: "root",
})
export class QrcodePopupService {
    private readonly sanitizer = inject(DomSanitizer);

    public async generateBannerLink({
        qrCodeUrl,
        iconUrl,
        title,
        subtitle,
    }: {
        qrCodeUrl: string;
        iconUrl: string;
        title: string;
        subtitle: string;
    }) {
        const [{ TopicBannerGenerator }, { BannerContext }] = await Promise.all([
            import("@/app/shared/services/banner-generator/strategies/topic-banner-generator"),
            import("@/app/shared/services/banner-generator/banner-context"),
        ]);

        const context = new BannerContext(
            new TopicBannerGenerator({
                qrCode: qrCodeUrl,
                icon: iconUrl,
                title: title,
                description: subtitle,
            }),
        );
        const finalUrl = await context.generate();

        if (!finalUrl) return null;

        return this.sanitizer.bypassSecurityTrustUrl(finalUrl);
    }

    public dataURLToBlob(dataURL: string): Blob {
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
