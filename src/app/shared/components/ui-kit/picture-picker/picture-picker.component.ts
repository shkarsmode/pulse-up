import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-picture-picker',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './picture-picker.component.html',
  styleUrl: './picture-picker.component.scss'
})
export class PicturePickerComponent {
  @Input() public id: string = '';
  @Input() public name: string = '';
  @Input() public previewUrl: string = '';
  @Input() public control: AbstractControl<File | null, any> | null = null;

  public selectedPicture: string | ArrayBuffer | null;
  public selectedTypeOfPicture: 'img' | 'gif' | 'smile' | '';

  ngOnInit(): void {
    this.selectedPicture = this.previewUrl;
  }

  public deleteChosenPicture(): void {
    this.control?.setValue(null);
    this.selectedTypeOfPicture = '';
    this.selectedPicture = '';
  }

  public onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    this.control?.setValue(file);
    this.updateSelectedFile();
  }

  private updateSelectedFile(): void {
    const file = this.control?.value;

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.selectedPicture = reader.result;
        this.selectedTypeOfPicture = this.getSelectedTypeOfPicture();
        console.log({ selectedPicture: this.selectedPicture, selectedTypeOfPicture: this.selectedTypeOfPicture });
        
      };
      reader.readAsDataURL(file);
    }
  }

  private getSelectedTypeOfPicture(): 'img' | 'gif' | 'smile' {
    const extension = this.getExtensionFromBase64(this.selectedPicture);
    switch (extension) {
      case 'png':
      case 'jpeg':
      case 'jpg':
        return 'img';
      case 'gif':
        return 'gif';
      default:
        return 'smile';
    }
  }

  private getExtensionFromBase64(dataUrl: any): string | null {
    const match = dataUrl.toString().match(/^data:(.+?);base64,/);
    if (match) {
      const mimeType = match[1];
      return mimeType.split('/')[1];
    }
    return null;
  }

}
