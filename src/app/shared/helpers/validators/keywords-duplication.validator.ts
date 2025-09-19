import { AbstractControl, ValidationErrors } from "@angular/forms";

export const keywordsDuplicationValidator = (group: AbstractControl): ValidationErrors | null => {
    const [keywords, category] = [
        (group.get("keywords")!.value as string[]) || [],
        (group.get("category")!.value as string) || "",
    ];

    const lowerCategory = category.trim().toLowerCase();
    const hasDuplicate = keywords.some((keyword) => keyword.trim().toLowerCase() === lowerCategory);

    if (hasDuplicate) {
        group.get("keywords")?.setErrors({ keywordMatchesCategory: true });
    }

    return null;
};
