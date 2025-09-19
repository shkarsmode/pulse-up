export class StringUtils {
    public static normalizeWhitespace(input: string): string {
        return input.trim().replace(/\s+/g, " ");
    }

    public static capitalize(input: string): string {
        return input.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    }

    public static toCRLF(input: string): string {
        return input.replaceAll("\n", "\r\n");
    }
}
