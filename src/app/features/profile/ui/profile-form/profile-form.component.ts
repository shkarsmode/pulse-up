import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { atLeastOneLetterValidator } from "@/app/shared/helpers/validators/at-least-one-letter.validator";
import { usernameUniqueValidator } from "@/app/shared/helpers/validators/username-unique.validator";
import { UserService } from "@/app/shared/services/api/user.service";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { TextareaComponent } from "@/app/shared/components/ui-kit/textarea/textarea.component";
import { PicturePickerComponent } from "@/app/shared/components/ui-kit/picture-picker/picture-picker.component";
import { pictureValidator } from "@/app/shared/helpers/validators/picture.validator";
import { optionalLengthValidator } from "@/app/shared/helpers/validators/optional-length.validator";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { UserStore } from "@/app/shared/stores/user.store";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import {
    CropImagePopupComponent,
    CropImagePopupData,
} from "@/app/features/user/ui/crop-image-popup/crop-image-popup.component";
import { CropResult } from "@/app/features/user/interfaces/crop-result.interface";
import { NotificationService } from "@/app/shared/services/core/notification.service";

@Component({
    selector: "app-profile-form",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        InputComponent,
        TextareaComponent,
        PrimaryButtonComponent,
        PicturePickerComponent,
    ],
    templateUrl: "./profile-form.component.html",
    styleUrl: "./profile-form.component.scss",
})
export class ProfileFormComponent {
    @Input() public initialValues: {
        name: string;
        username: string;
        bio: string;
        picture: string | null;
    };

    private dialog = inject(MatDialog);
    private fb: FormBuilder = inject(FormBuilder);
    private userStore: UserStore = inject(UserStore);
    private userService: UserService = inject(UserService);
    private settingsService: SettingsService = inject(SettingsService);
    private notificationService: NotificationService = inject(NotificationService);
    private authenticationService: AuthenticationService = inject(AuthenticationService);

    private isPicturePristine: boolean = true;
    private emailPlaceholder: string = "Add an email to secure your account";
    public form: FormGroup;
    public submitting: boolean = false;
    public errorMessage: string | null = null;
    public phoneNumber: string | null = null;
    public email: string = this.emailPlaceholder;
    public profilePicture: File | null = null;
    public chngeEmailRoute = "/" + AppRoutes.Profile.CHANGE_EMAIL;
    public chngePhoneNumberRoute = "/" + AppRoutes.Profile.CHANGE_PHONE_NUMBER;
    public classes = {
        email: {},
    };

    constructor() {
        this.form = this.fb.group({
            name: "",
            username: "",
            bio: "",
            profilePicture: null,
        });
        this.phoneNumber = this.authenticationService.firebaseAuth.currentUser?.phoneNumber || null;
        this.email =
            this.authenticationService.firebaseAuth.currentUser?.email || this.emailPlaceholder;
        this.profilePicture = this.form.get("profilePicture")?.value || null;
    }

    ngOnInit() {
        this.form = this.fb.group({
            name: [
                this.initialValues.name,
                [
                    Validators.required,
                    Validators.maxLength(50),
                    Validators.pattern(/^[A-Za-z\s']+$/),
                ],
            ],
            username: [
                this.initialValues.username,
                [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(50),
                    Validators.pattern(/^(?!.*__)(?:[A-Za-z0-9]*_?[A-Za-z0-9]*)$/),
                    atLeastOneLetterValidator(),
                ],
                [
                    usernameUniqueValidator(
                        this.userService.validateUsername,
                        this.initialValues.username,
                    ),
                ],
            ],
            bio: [this.initialValues.bio, [optionalLengthValidator(3, 150)]],
            profilePicture: [null, [pictureValidator()]],
        });
        this.form.valueChanges.subscribe((values) => {
            this.errorMessage = null;
        });
        this.form.get("profilePicture")?.valueChanges.subscribe((value) => {
            this.isPicturePristine = false;
        });
        this.classes.email = {
            "profile-form__link": true,
            "profile-form__link--placeholder": this.email === this.emailPlaceholder,
        };
    }

    public get previewUrl(): string {
        if (this.initialValues.picture) {
            return `${this.settingsService.blobUrlPrefix}${this.initialValues.picture}`;
        }
        return "assets/svg/plus-placeholder.svg";
    }

    private disabled: boolean = false;

    public isDisabled(): boolean {
        let disabled = false;
        if (this.submitting) {
            disabled = true;
        } else if (this.isPristine()) {
            disabled = true;
        } else if (this.submitting || this.form.invalid) {
            disabled = true;
        } else if (this.form.status === "PENDING") {
            disabled = this.disabled;
        }
        this.disabled = disabled;
        return disabled;
    }

    public onBlur(name: string) {
        const control = this.form.get(name);
        if (control) {
            control.markAsTouched();
        }
    }

    public onSelectPicture(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const dialogRef = this.dialog.open<CropImagePopupComponent, CropImagePopupData>(
                CropImagePopupComponent,
                {
                    width: "100%",
                    maxWidth: "630px",
                    panelClass: "custom-dialog-container",
                    backdropClass: "custom-dialog-backdrop",
                    data: {
                        event: event,
                        minWidth: 128,
                        minHeight: 128,
                        aspectRatio: 1,
                    },
                },
            );
            dialogRef.afterClosed().subscribe(this.onCroppedImage);
        }
    }

    public onDeletePicture(): void {
        this.form.get("profilePicture")?.setValue(null);
    }

    public submit(event: MouseEvent) {
        event.preventDefault();
        if (this.form.valid) {
            this.trimBioValue();
            this.submitting = true;
            this.userService.updateOwnProfile(this.form.value).subscribe({
                next: () => {
                    this.submitting = false;
                    this.form.markAsPristine();
                    this.form.markAsUntouched();
                    this.isPicturePristine = true;
                    this.userStore.refreshProfile();
                },
                error: () => {
                    this.submitting = false;
                    this.errorMessage = "Failed to update profile. Please try again.";
                },
            });
        } else {
            this.form.markAllAsTouched();
        }
    }

    public getNameErrorMessage(): string | null {
        const control = this.form.get("name");
        if (!control || !(control.touched || control.dirty) || control.valid) {
            return null;
        }

        if (control.hasError("required")) {
            return "Name is required";
        }
        if (control.hasError("maxlength")) {
            return "Name must be 50 characters or less";
        }
        if (control.hasError("pattern")) {
            return "Name must contain only letters";
        }

        return null;
    }

    public getUsernameErrorMessage(): string | null {
        const control = this.form.get("username");
        if (!control || !(control.touched || control.dirty) || control.valid) {
            return null;
        }

        if (control.hasError("required")) {
            return "Username is required";
        }
        if (control.hasError("minlength")) {
            return "Username must be at least 6 characters long";
        }
        if (control.hasError("maxlength")) {
            return "Username must be 50 characters or less";
        }
        if (control.hasError("pattern")) {
            return "Username must be alphanumeric and can include one underscore";
        }
        if (control.hasError("noLetter")) {
            return "Must contain at least one letter.";
        }
        if (control.hasError("notUnique")) {
            return "Username already taken.";
        }

        return null;
    }

    public getBioErrorMessage(): string | null {
        const control = this.form.get("bio");
        if (!control || !(control.touched || control.dirty) || control.valid) {
            return null;
        }

        if (control.hasError("required")) {
            return "Bio is required";
        }
        if (control.hasError("minlength")) {
            return "Bio must be at least 3 characters long";
        }
        if (control.hasError("maxlength")) {
            return "Bio must be 150 characters or less";
        }

        return null;
    }

    public getPictureErrorMessage(): string | null {
        const control = this.form.get("profilePicture");
        if (!control || !control?.value) {
            return null;
        }

        if (control.hasError("missingName")) {
            return "Picture must have a name";
        }
        if (control.hasError("invalidType")) {
            return "File must be an image";
        }
        if (control.hasError("invalidExtension")) {
            return "Only .png, .jpg, .jpeg allowed";
        }
        if (control.hasError("fileTooLarge")) {
            return "File must be smaller than 10 MB";
        }

        return null;
    }

    private trimBioValue() {
        const control = this.form.get("bio");
        if (typeof control?.value !== "string") return;

        const original = control.value;
        const trimmed = original
            .replace(/\n{2,}/g, "\n") // reduce multiple \n to one
            .replace(/[ \t]+/g, " ") // remove extra spaces and tabs
            .trim();

        this.form.patchValue({ bio: trimmed });
    }

    private isPristine(): boolean {
        return (
            (this.form.get("name")?.pristine &&
                this.form.get("username")?.pristine &&
                this.form.get("bio")?.pristine &&
                this.isPicturePristine) ||
            false
        );
    }

    private onCroppedImage = (result: CropResult) => {
        if (result.success) {
            this.form.get("profilePicture")?.patchValue(result.imageFile);
            this.isPicturePristine = false;
            this.profilePicture = result.imageFile;
        } else if (result.message) {
            this.notificationService.error(result.message);
        }
    };
}
