import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  public notification$: Subject<string> = new Subject();

  constructor(public snackBar: MatSnackBar) { }

  public open(message, action = '', duration = 30000)
  {
    this.snackBar.open(message, action, { duration });
  }
}
