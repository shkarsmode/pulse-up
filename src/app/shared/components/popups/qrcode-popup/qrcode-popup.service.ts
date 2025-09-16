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

    public async getBase64Image(imageUrl: string): Promise<string | null> {
        try {
            const response = await fetch(
                `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`,
            );
            if (!response.ok) return null;

            const blob = await response.blob();
            return await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => reject("Failed to convert blob to base64");
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error fetching image:", error);
            return null;
        }
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
