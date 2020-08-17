import { Component, OnInit } from '@angular/core';
import { AuthService } from '../security/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  isAuthenticated: boolean;

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.auth.isAuthenticated().subscribe({
      next: (isAuthenticated) => this.isAuthenticated = isAuthenticated,
      error: (err) => {
        console.warn(`Could not submit comment: ${err.message}`);
      },
    });
  }
}