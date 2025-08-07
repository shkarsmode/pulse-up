import { inject, Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import linkifyHtml from "linkify-html";
import { Opts } from "linkifyjs";
import escape from "lodash.escape";
@Pipe({
    name: "linkify",
    standalone: true,
})
export class LinkifyPipe implements PipeTransform {
    private readonly sanitizer = inject(DomSanitizer);

    transform(text: string | null | undefined): SafeHtml | string {
        if (!text) return "";

        const linkifyOptions: Opts = {
            defaultProtocol: "https",
            target: { url: "_blank" },
            rel: "noopener noreferrer",
            className: "external-link",
        };

        // Converts the characters "&", "<", ">", '"', and "'" in string to their corresponding HTML entities.
        const escaped = escape(text);
        // Linkify and format newlines
        const formatted = linkifyHtml(escaped.replace(/\n/g, "<br>"), linkifyOptions);

        return this.sanitizer.bypassSecurityTrustHtml(formatted);
    }
}
