import { FormGroup } from "@angular/forms";

export const keywordsDuplicationValidator = (formGroup: FormGroup): null => {
    const [keywords, category] = [
        (formGroup.get("keywords")!.value as string[]) || [],
        (formGroup.get("category")!.value as string) || "",
    ];

    const lowerCategory = category.trim().toLowerCase();
    const hasDuplicate = keywords.some((keyword) => keyword.trim().toLowerCase() === lowerCategory);

    formGroup.get("keywords")!.setErrors(hasDuplicate ? { keywordMatchesCategory: true } : null);

    return null;
};
