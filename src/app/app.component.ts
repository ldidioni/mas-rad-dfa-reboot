import { Component } from '@angular/core';
/* import { MatSnackBar } from '@angular/material/snack-bar';
import { MessagingService } from './shared/services/messaging.service'; */

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'citizen-engagement';

/*   constructor(private messagingService: MessagingService, private snackBar: MatSnackBar)
  {
    this.messagingService.notification$.subscribe(message => {
      this.snackBar.open(message);
    });
  } */
}
