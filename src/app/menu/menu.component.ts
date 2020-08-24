import { Component, OnInit } from '@angular/core';
import { AuthService } from '../security/auth.service';

/**
 * Application menu
 */
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  isAuthenticated: boolean;

  constructor(private auth: AuthService) { }

  /**
   * On component initialization, we determine if the current user is authenticated.
   * This conditions which items are displayed in the menu.
   */
  ngOnInit(): void {
    this.auth.isAuthenticated().subscribe({
      next: (isAuthenticated) => this.isAuthenticated = isAuthenticated,
      error: (err) => {
        console.warn(`Could not determine if current user is authenticated: ${err.message}`);
      },
    });
  }
}