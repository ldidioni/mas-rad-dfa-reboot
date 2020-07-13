import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginPageComponent } from './security/login-page/login-page.component';
import { DummyPageComponent } from './dummy-page/dummy-page.component';
import { RegisterPageComponent } from './security/register-page/register-page.component';
import { AuthGuard } from './security/guards/auth.guard';
import { IssueNewComponent } from './issue/issue-new/issue-new.component';
import { IssueListComponent } from './issue/issue-list/issue-list.component';


const routes: Routes = [
  { path: "", redirectTo: "dummy", pathMatch: "full" },
  { path: "login", component: LoginPageComponent },
  { path: "register", component: RegisterPageComponent },
  { path: "issue/new", component: IssueNewComponent },
  { path: "issues", component: IssueListComponent },
  // Add the route to display the dummy page
  {
    path: "dummy",
    component: DummyPageComponent,
    // Prevent access to this page to unauthenticated users
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
