import { Component, } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
  standalone: true,
  imports: [
    SvgIconComponent,
  ]
})
export class LogoComponent {

  public window = window;

}


// export class LogoComponent implements AfterViewInit {

//   private loadingService: LoadingService = inject(LoadingService);

//   private stopLogoAnimationFunction: Function;
//   public window = window;

//   // @HostBinding('style.width') hostWidth: string = '91px';
//   // @HostBinding('style.width') hostWidth: string = '320px';

//   ngOnInit(): void {
    
//   }

//   ngAfterViewInit(): void {
//     this.stopLogoAnimationFunction = this.initLogoAnimation();
//     this.loadingService.isLoadingObservable.subscribe((val) => {
//         if(val) return;
//         this.stopLogoAnimation();
//         // this.hostWidth = '320px'; // finish slide name animation
//     })
//   }

//   private initLogoAnimation(): Function {
//     const icons = document.getElementById('icons') as HTMLElement;

//     if (!icons) {
//       console.error('Icons element not found.');
//       return () => {}; // If the .icons element isn't found, stop execution
//     }

//     let orderMap = [
//       { id: 'block1', order: 1 },
//       { id: 'block2', order: 2 },
//     ];
    
//     let shuffleBlocks = () => {
//       // Step 1: Apply translation with animation
//       icons.style.transition = 'transform 1s ease';
//       icons.style.transform = 'translateX(-100%)';
    
//       // Step 2: After animation, reset order and remove transition
//       setTimeout(() => {
//         // Change order logic
//         icons.style.transition = 'none'; // Remove animation
//         icons.style.transform = 'translateX(0)'; // Reset translate
    
//         // Update the order map
//         orderMap = orderMap.map(block => {
//           block.order -= 1;
//           if (block.order === 0) block.order = 2;
//           return block;
//         });
    
//         // Apply the new order to the blocks
//         orderMap.forEach(block => {
//           const element = document.getElementById(block.id);
//           if(element) {
//             element.style.order = block.order.toString();
//           }
//           // document.getElementById(block.id).style.order = block.order;
//         });
    
//         // Step 3: Reapply animation for the next cycle
//         setTimeout(() => {
//           icons.style.transition = 'transform 1s ease';
//           icons.style.transform = 'translateX(-100%)';
//         }, 25); // Small delay to avoid flicker
//       }, 0); // Match the duration of the transform animation
//     }
    
//     // Repeat every 2 seconds
//     let interval = setInterval(shuffleBlocks, 1500);

//     return () => {
//       clearInterval(interval);
//       icons.style.transition = 'none'; // Remove animation
//       icons.style.transform = 'translateX(0)';

//     }
    
//   }

//   private stopLogoAnimation(): void {
//       this.stopLogoAnimationFunction();
//   }



// }

