import { BannerData } from "@/app/shared/interfaces/banner/banner-data";
import { BaseBannerGenerator } from "../base-banner-generator";

export class TopicBannerGenerator extends BaseBannerGenerator {
    qrCode: string;
    title: string;
    description: string;
    icon: string;

    constructor(data: Required<BannerData>) {
        super(data);
        this.qrCode = data.qrCode;
        this.title = data.title;
        this.description = data.description;
        this.icon = data.icon;
    }

    protected renderTemplate(): HTMLElement {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = `
        <style>
        .banner-template-container {
          position: relative;
          width: calc(210px * 3);
          height: calc(297px * 3);
          padding: 40px 16px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          background-color: #fff;
          font-family: "SFProText", sans-serif;
        }
        .banner-template-icon {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }
        .banner-template-title {
          font-size: 32px;
          font-weight: bold;
          margin-block: 24px;
        }
        .banner-template-description {
          font-size: 18px;
          line-height: 1.25;
          margin-block: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 15;
          line-clamp: 15;
          -webkit-box-orient: vertical;
        }
        .banner-template-logo {
          position: absolute;
          top: 20px;
          right: 16px;
          height: 40px;
          object-fit: contain;
        }
        .banner-template-qr-code {
          margin-top: 20px;
          width: 300px;
          height: 300px;
          object-fit: contain;
        }
      </style>
      
      <div class="banner-template-container">
        <img src="assets/svg/logo.svg" class="banner-template-logo" />
        <img src="${this.icon}" class="banner-template-icon" />
        <h1 class="banner-template-title">${this.title}</h1>
        <p class="banner-template-description" data-linkify>
          ${this.description}
        </p>
        <img src="${this.qrCode}" class="banner-template-qr-code" />
      </div>
    `;

        return wrapper;
    }

    protected getFileName(): string {
        return `PulseUp - ${this.title}.png`;
    }
}
