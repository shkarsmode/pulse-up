import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatNumber',
    standalone: true,
})
export class FormatNumberPipe implements PipeTransform {
    public transform(value: number): string {
        if (value / 1_000_000 >= 10) 
            return Math.floor(value / 1_000_000) + 'M';

        if (value / 1_000_000 >= 1) 
            return this.getRoundedToOneDecimalValueBasedOnNumber(value, 1_000_000) + 'M';

        if (value / 1_000 >= 10) 
            return Math.floor(value / 1_000) + 'K';
        
        if (value / 1_000 >= 1) 
            return this.getRoundedToOneDecimalValueBasedOnNumber(value, 1_000) + 'K';

        return value.toString();
    }

    private getRoundedToOneDecimalValueBasedOnNumber(
        value: number,
        segmentationValue: number
    ): number {
        return Math.round((value * 10) / segmentationValue) / 10;
    }
}
