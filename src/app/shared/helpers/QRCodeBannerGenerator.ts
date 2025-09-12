import { Injectable } from "@angular/core";

export interface BannerOptions {
    title?: string;
    description?: string;
    qrImageUrl: string; // URL of QR code image
    qrSize?: number;
}

@Injectable()
export class QRCodeBannerGenerator {

    private readonly titleFontSize = 120;
    private readonly descriptionFontSize = 80;
    private readonly titleLineHeight = this.titleFontSize * 1.2;
    private readonly descriptionLineHeight = this.descriptionFontSize * 1.25;
    private readonly maxTitleLines = 5;
    private readonly maxDescriptionLines = 16;

    static readonly canvasWidth = 2480;
    static readonly canvasHeight = 3508;

    async generateBanner(options: BannerOptions): Promise<string> {
        const { title = "", description = "", qrImageUrl, qrSize = 800 } = options;

        const img = await this.loadImage(qrImageUrl);

        const canvas = document.createElement("canvas");
        canvas.width = QRCodeBannerGenerator.canvasWidth;
        canvas.height = QRCodeBannerGenerator.canvasHeight;
        const ctx = canvas.getContext("2d")!;

        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- 1. Prepare lines for title & description ---
        ctx.font = `bold ${this.titleFontSize}px Arial`;
        const titleLines = this.wrapText(ctx, title, canvas.width - 200, this.maxTitleLines);

        ctx.font = `${this.descriptionFontSize}px Arial`;
        const descriptionLines = this.wrapText(
            ctx,
            description,
            canvas.width - 200,
            this.maxDescriptionLines,
        );

        // --- 2. Measure block height (title + spacing + description + spacing + QR) ---
        const blockHeight =
            titleLines.length * this.titleLineHeight +
            (title ? 40 : 0) +
            descriptionLines.length * this.descriptionLineHeight +
            (description ? 100 : 0) + // gap before QR
            qrSize;

        // --- 3. Calculate starting Y for vertical centering ---
        let currentY = (QRCodeBannerGenerator.canvasHeight - blockHeight) / 2;

        // --- 4. Draw title ---
        if (titleLines.length) {
            ctx.font = `bold ${this.titleFontSize}px Arial`;
            ctx.fillStyle = "#000";
            ctx.textAlign = "center";

            titleLines.forEach((line) => {
                ctx.fillText(line, canvas.width / 2, currentY);
                currentY += this.titleLineHeight;
            });
            currentY += 40; // space after title
        }

        // --- 5. Draw description ---
        if (descriptionLines.length) {
            ctx.font = `${this.descriptionFontSize}px Arial`;
            ctx.fillStyle = "#333";
            ctx.textAlign = "center";

            descriptionLines.forEach((line) => {
                ctx.fillText(line, canvas.width / 2, currentY);
                currentY += this.descriptionLineHeight;
            });
            currentY += 20; // space before QR
        }

        // --- 6. Draw QR code ---
        const qrX = (canvas.width - qrSize) / 2;
        ctx.drawImage(img, qrX, currentY, qrSize, qrSize);

        // --- 7. Export ---
        const finalUrl = canvas.toDataURL("image/png");
        return finalUrl;
    }

    private wrapText(
        ctx: CanvasRenderingContext2D,
        text: string,
        maxWidth: number,
        maxLines: number,
    ): string[] {
        const lines: string[] = [];
        const paragraphs = text.split(/\n\n/); // split by empty line (paragraphs)

        for (let p = 0; p < paragraphs.length; p++) {
            const rawLines = paragraphs[p].split(/\n/); // split by single line breaks

            for (const rawLine of rawLines) {
                const words = rawLine.split(" ");
                let currentLine = "";

                for (const word of words) {
                    // 🔹 Handle long words (like links)
                    if (ctx.measureText(word).width > maxWidth) {
                        let subWord = "";
                        for (const char of word) {
                            const testLine = subWord + char;
                            if (ctx.measureText(testLine).width > maxWidth) {
                                if (lines.length === maxLines) {
                                    lines[maxLines - 1] += " ...";
                                    return lines;
                                }
                                lines.push(subWord);
                                subWord = char;
                            } else {
                                subWord = testLine;
                            }
                        }

                        if (subWord) {
                            if (!currentLine) {
                                currentLine = subWord;
                            } else if (
                                ctx.measureText(currentLine + " " + subWord).width <= maxWidth
                            ) {
                                currentLine += " " + subWord;
                            } else {
                                lines.push(currentLine);
                                currentLine = subWord;
                            }
                        }
                        continue;
                    }

                    // 🔹 Normal word wrapping
                    const testLine = currentLine ? currentLine + " " + word : word;
                    if (ctx.measureText(testLine).width <= maxWidth) {
                        currentLine = testLine;
                    } else {
                        lines.push(currentLine);
                        currentLine = word;

                        if (lines.length === maxLines) {
                            lines[maxLines - 1] += " ...";
                            return lines;
                        }
                    }
                }

                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = "";
                }
            }

            // 🔹 Add empty line for paragraph break, but not after the last one
            if (p < paragraphs.length - 1) {
                lines.push("");
            }
        }

        // truncate if still exceeding maxLines
        if (lines.length > maxLines) {
            lines.length = maxLines;
            lines[maxLines - 1] += " ...";
        }

        return lines;
    }

    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
        });
    }
}
