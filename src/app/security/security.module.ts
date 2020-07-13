import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';

import { LoginPageComponent } from './login-page/login-page.component';
import { LogoutButtonComponent } from './logout-button/logout-button.component';
import { RegisterPageComponent } from './register-page/register-page.component';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    LoginPageComponent,
    LogoutButtonComponent,
    RegisterPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatInputModule
  ],
  exports: [
    LoginPageComponent,
    LogoutButtonComponent,
    RegisterPageComponent
  ]
})
export class SecurityModule { }
