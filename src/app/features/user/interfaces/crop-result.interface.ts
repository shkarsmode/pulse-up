import { SafeUrl } from "@angular/platform-browser";

interface SuccessCropResult {
    success: true;
    imageUrl: SafeUrl;
    imageFile: File | null;
}

interface ErrorCropResult {
    success: false;
    message: string;
}

export type CropResult = SuccessCropResult | ErrorCropResult;