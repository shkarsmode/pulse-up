import { Opts } from "linkifyjs";
import { BannerData } from "../../interfaces/banner/banner-data";
import { BannerStrategy } from "../../interfaces/banner/banner-strategy";

const linkifyOptions: Opts = {
    defaultProtocol: "https",
    target: { url: "_blank" },
    rel: "noopener noreferrer",
    className: "external-link",
};

export abstract class BaseBannerGenerator implements BannerStrategy {
    protected container: HTMLElement;
    protected data: BannerData;

    constructor(data: BannerData) {
        this.data = data;
        let root = document.getElementById("banner-template-root");
        if (!root) {
            root = document.createElement("div");
            root.id = "banner-template-root";
            root.style.zIndex = '-1';
            root.style.position = 'fixed';
            root.style.top = '0';
            root.style.left = '0';
            root.ariaHidden = "true";
            document.body.appendChild(root);
        }
        this.container = root;
    }

    public async generateBanner(): Promise<string> {
        try {
            this.container.innerHTML = "";

            const template = this.renderTemplate(this.data);
            this.container.appendChild(template);

            await this.applyLinkify(template);

            const { toPng } = await import("html-to-image");

            const root = document.getElementById("banner-template-root");
            if (!root) throw new Error("Banner template root not found");

            const dataUrl = await toPng(root, {
                width: root.scrollWidth,
                height: root.scrollHeight,
            });

            this.container.innerHTML = "";

            return dataUrl;
        } catch (error) {
            console.log("Error generating banner:", error);
            throw new Error("Failed to generate banner");
        }
    }

    protected abstract renderTemplate(data: BannerData): HTMLElement;
    protected abstract getFileName(): string;

    private async applyLinkify(root: HTMLElement) {
        const linkifyHtml = await import("linkify-html").then((module) => module.default);
        root.querySelectorAll<HTMLElement>("[data-linkify]").forEach((el) => {
            el.innerHTML = linkifyHtml(el.innerText, linkifyOptions);
        });
    }
}
