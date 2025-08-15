export class StringUtils {
    static normalizeWhitespace(input: string): string {
        return input.trim().replace(/\s+/g, " ");
    }
}
