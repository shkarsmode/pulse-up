 type RgbColor = { red: number; green: number; blue: number };

type ExtractedColors = {
    averageColor: RgbColor;
    vibrantColor: RgbColor;
    averageCss: string;
    vibrantCss: string;
    overlayGradientCss: string;
    gradientColorCss: string;
    isLightBackground: boolean;
};

export async function extractBeautifulColorsFromImageUrl(imageUrl: string): Promise<ExtractedColors> {
    const imageElement = await loadImageElement(imageUrl);

    const canvasElement = document.createElement('canvas');
    const canvasContext = canvasElement.getContext('2d', { willReadFrequently: true });

    if (!canvasContext) {
        throw new Error('Canvas 2D context is not available');
    }

    // Downscale for speed and stability
    const targetWidth = 160;
    const scale = targetWidth / imageElement.naturalWidth;
    const targetHeight = Math.max(1, Math.floor(imageElement.naturalHeight * scale));

    canvasElement.width = targetWidth;
    canvasElement.height = targetHeight;

    canvasContext.drawImage(imageElement, 0, 0, targetWidth, targetHeight);

    const imageData = canvasContext.getImageData(0, 0, targetWidth, targetHeight);
    const { data } = imageData;

    const averageAccumulator = { red: 0, green: 0, blue: 0, count: 0 };
    let bestVibrant: RgbColor = { red: 120, green: 120, blue: 120 };
    let bestVibrantScore = -1;

    // Step = 2 pixels for speed
    const bytesPerPixel = 4;
    const stepPixels = 2;
    const stepBytes = bytesPerPixel * stepPixels;

    for (let byteIndex = 0; byteIndex < data.length; byteIndex += stepBytes) {
        const red = data[byteIndex];
        const green = data[byteIndex + 1];
        const blue = data[byteIndex + 2];
        const alpha = data[byteIndex + 3];

        if (alpha < 200) {
            continue;
        }

        // Ignore near-white and near-black pixels to avoid washed colors
        const maxChannel = Math.max(red, green, blue);
        const minChannel = Math.min(red, green, blue);

        if (maxChannel > 245) {
            continue;
        }
        if (maxChannel < 18) {
            continue;
        }

        // Average color accumulator
        averageAccumulator.red += red;
        averageAccumulator.green += green;
        averageAccumulator.blue += blue;
        averageAccumulator.count += 1;

        // Vibrant candidate: high saturation, mid lightness
        const saturation = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel; // 0..1
        const lightness = (maxChannel + minChannel) / 2 / 255; // 0..1

        // Prefer saturated, avoid too dark/bright
        const lightnessPenalty = Math.abs(lightness - 0.55); // closer to 0.55 is better
        const vibrantScore = saturation * 1.2 - lightnessPenalty * 0.8;

        if (vibrantScore > bestVibrantScore) {
            bestVibrantScore = vibrantScore;
            bestVibrant = { red, green, blue };
        }
    }

    const averageColor: RgbColor = averageAccumulator.count > 0
        ? {
            red: Math.round(averageAccumulator.red / averageAccumulator.count),
            green: Math.round(averageAccumulator.green / averageAccumulator.count),
            blue: Math.round(averageAccumulator.blue / averageAccumulator.count),
        }
        : { red: 120, green: 120, blue: 120 };

    const averageCss = rgbToCss(averageColor);
    const vibrantCss = rgbToCss(bestVibrant);

    // Build a darker, slightly more saturated base color for the gradient
    const darkerVibrant = darkenColor(bestVibrant, 0.10); // reduce lightness by 10%
    const gradientColorCss = rgbaToCss(darkerVibrant, 0.98);

    // Example overlay similar to your screenshot style (kept for compatibility)
    const overlayGradientCss =
        `linear-gradient(180deg, ${rgbaToCss(bestVibrant, 0.85)} 0%, ${rgbaToCss(averageColor, 0.90)} 45%, ${rgbaToCss(averageColor, 0.95)} 100%)`;

    // Calculate luminance to determine if background is light or dark
    // Use the vibrant color as it's more prominent in the gradient
    const isLightBackground = calculateRelativeLuminance(bestVibrant) > 0.5;

    return {
        averageColor,
        vibrantColor: bestVibrant,
        averageCss,
        vibrantCss,
        overlayGradientCss,
        gradientColorCss,
        isLightBackground,
    };
}

function loadImageElement(imageUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const imageElement = new Image();
        imageElement.crossOrigin = 'anonymous'; // requires CORS headers on server
        imageElement.onload = () => resolve(imageElement);
        imageElement.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
        imageElement.src = imageUrl;
    });
}

function rgbToCss(color: RgbColor): string {
    return `rgb(${color.red}, ${color.green}, ${color.blue})`;
}

function rgbaToCss(color: RgbColor, alpha: number): string {
    return `rgba(${color.red}, ${color.green}, ${color.blue}, ${alpha})`;
}

function darkenColor(color: RgbColor, amount = 0.15): RgbColor {
    // Convert to HSL, increase saturation slightly and reduce lightness, convert back
    const { h, s, l } = rgbToHsl(color.red, color.green, color.blue);
    const newS = Math.min(1, s + 0.08); // slightly more saturated
    const newL = Math.max(0, l - amount);
    const { r, g, b } = hslToRgb(h, newS, newL);
    return { red: Math.round(r), green: Math.round(g), blue: Math.round(b) };
}

function rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number) {
    let r: number, g: number, b: number;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r: r * 255, g: g * 255, b: b * 255 };
}

/**
 * Calculate relative luminance according to WCAG standards
 * Returns a value between 0 (darkest) and 1 (lightest)
 */
function calculateRelativeLuminance(color: RgbColor): number {
    // Convert RGB to sRGB
    const rsRGB = color.red / 255;
    const gsRGB = color.green / 255;
    const bsRGB = color.blue / 255;

    // Apply gamma correction
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    // Calculate relative luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
