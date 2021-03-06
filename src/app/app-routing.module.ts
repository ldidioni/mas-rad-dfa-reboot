import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginPageComponent } from './security/login-page/login-page.component';
import { DummyPageComponent } from './dummy-page/dummy-page.component';
import { RegisterPageComponent } from './security/register-page/register-page.component';
import { AuthGuard } from './security/guards/auth.guard';
import { PermissionGuard } from './security/guards/permission.guard';
import { IssueNewComponent } from './issue/issue-new/issue-new.component';
import { IssueListComponent } from './issue/issue-list/issue-list.component';
import { IssueDetailComponent } from './issue/issue-detail/issue-detail.component';
import { IssueEditComponent } from './issue/issue-edit/issue-edit.component';


const routes: Routes = [
  { path: "", redirectTo: "issues", pathMatch: "full" },
  { path: "login", component: LoginPageComponent },
  { path: "register", component: RegisterPageComponent },
  { path: "issue/new", component: IssueNewComponent, canActivate: [AuthGuard] },
  { path: 'issue/:id/edit', component: IssueEditComponent, canActivate: [AuthGuard, PermissionGuard] },
  { path: 'issue/:id', component: IssueDetailComponent, canActivate: [AuthGuard] },
  { path: "issues", component: IssueListComponent, canActivate: [AuthGuard] },
  // Add the route to display the dummy page
  {
    path: "dummy",
    component: DummyPageComponent,
    // Prevent access to this page to unauthenticated users
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
