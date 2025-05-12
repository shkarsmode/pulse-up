export class MediaUtilsService {
    public static checkIfTouchDevice() {
        return window.matchMedia("(pointer: coarse)").matches;
    }
}
