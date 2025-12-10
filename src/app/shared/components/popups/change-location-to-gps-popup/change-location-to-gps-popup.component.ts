import { LocationSource } from '@/app/shared/enums/location-source.enum';
import { IGeolocation } from '@/app/shared/interfaces';
import { GeolocationService } from '@/app/shared/services/core/geolocation.service';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import { SvgIconComponent } from 'angular-svg-icon';
import { NotificationService } from '../../../services/core/notification.service';
import { CloseButtonComponent } from '../../ui-kit/buttons/close-button/close-button.component';
import { PrimaryButtonComponent } from '../../ui-kit/buttons/primary-button/primary-button.component';

@Component({
    selector: 'app-change-location-to-gps-popup',
    standalone: true,
    imports: [
        CloseButtonComponent, 
        PrimaryButtonComponent, 
        AsyncPipe, 
        SvgIconComponent
    ],
    templateUrl: './change-location-to-gps-popup.component.html',
    styleUrl: './change-location-to-gps-popup.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeLocationToGpsPopupComponent implements OnInit {
    public dialogRef: MatDialogRef<ChangeLocationToGpsPopupComponent> = inject(MatDialogRef);
    public geolocationService: GeolocationService = inject(GeolocationService);
    public currentLocation: WritableSignal<IGeolocation | null> = signal(null);
    public LocationSource: typeof LocationSource = LocationSource;

    private notificationService = inject(NotificationService);
    private destroyRef = inject(DestroyRef);

    public ngOnInit(): void {
        this.initGeolocationStatusListener();
        this.geolocationService.getCurrentGeolocationAsync().then((location) => {
            this.currentLocation.set(location);
        });
    }

    private initGeolocationStatusListener(): void {
        this.geolocationService.status$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((status) => {
                if (status === 'error') {
                    this.notificationService.error(
                        'Failed to get location. Please enable location access.'
                    );
                }
            });
    }

    public async enableLocationAccess(): Promise<void> {
        const value = await this.geolocationService.getCurrentGeolocationAsync({ forceGps: true });
        this.currentLocation.set(value);
    }

    public onCloseDialog(): void {
        this.dialogRef.close();
    }
}
