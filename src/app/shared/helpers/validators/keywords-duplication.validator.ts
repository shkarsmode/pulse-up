import { AbstractControl } from "@angular/forms";

export const keywordsDuplicationValidator = (group: AbstractControl): null => {
    const [keywords, category] = [
        (group.get("keywords")!.value as string[]) || [],
        (group.get("category")!.value as string) || "",
    ];

    const lowerCategory = category.trim().toLowerCase();
    const hasDuplicate = keywords.some((keyword) => keyword.trim().toLowerCase() === lowerCategory);

    group.get("keywords")!.setErrors(hasDuplicate ? { keywordMatchesCategory: true } : null);

    return null;
};
