import { TopicLocation } from '@/app/features/user/interfaces/topic-location.interface';
import { PlacesAutocompleteComponent } from '@/app/shared/components/places-autocomplete/places-autocomplete.component';
import { PrimaryButtonComponent } from '@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component';
import { PopupTextComponent } from '@/app/shared/components/ui-kit/popup/popup-text/popup-text.component';
import { PopupTitleComponent } from '@/app/shared/components/ui-kit/popup/popup-title/popup-title.component';
import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-fallback-determine-location',
    standalone: true,
    imports: [PlacesAutocompleteComponent, PopupTextComponent, PrimaryButtonComponent, PopupTitleComponent],
    templateUrl: './fallback-determine-location.component.html',
    styleUrl: './fallback-determine-location.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FallbackDetermineLocationComponent {
    private readonly dialogRef = inject(MatDialogRef<FallbackDetermineLocationComponent>);

    public selectedLocation: WritableSignal<TopicLocation | null> = signal(null);

    public onLocationSelected(results: TopicLocation | null): void {
        if (!results) return;
        
        this.selectedLocation.set(results);
    }

    public onApproveLocation(): void {
        if (!this.selectedLocation()) return;
        this.dialogRef.close(this.selectedLocation());
    }
}
