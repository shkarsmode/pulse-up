import { AbstractControl, ValidationErrors } from "@angular/forms";

export const keywordsDuplicationValidator = (group: AbstractControl): ValidationErrors | null => {
    const keywordsControl = group.get("keywords") as AbstractControl<string[]>;
    const categoryControl = group.get("category") as AbstractControl<string>;

    if (!keywordsControl || !categoryControl) {
        return null;
    }

    const keywords = keywordsControl?.value;
    const category = categoryControl?.value;
    
    if(!Array.isArray(keywords) || typeof category !== "string" || !category.length) {
        return null;
    }

    const lowerCategory = category.trim().toLowerCase();
    const hasDuplicate = keywords.some((keyword) => keyword.trim().toLowerCase() === lowerCategory);
    const errors = keywordsControl.errors;

    if (hasDuplicate) {
        if (errors && Object.keys(errors).length > 0) {
            keywordsControl.setErrors({ ...errors, keywordMatchesCategory: true });
        } else {
            keywordsControl.setErrors({ keywordMatchesCategory: true });
        }
    } else {
        delete errors?.["keywordMatchesCategory"];
        if (errors && Object.keys(errors).length > 0) {
            keywordsControl.setErrors({ ...errors, keywordMatchesCategory: false });
        } else {
            keywordsControl.setErrors(null);
        }
    }
    return null;
};
