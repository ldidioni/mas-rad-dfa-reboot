import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

/**
 * Service which governs the instantiation of a snackbar to display success or error messages
 */
@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  public notification$: Subject<string> = new Subject();

  constructor(public snackBar: MatSnackBar) { }

  public open(message, action = '', duration = 5000)
  {
    this.snackBar.open(message, action, { duration });
  }
}
