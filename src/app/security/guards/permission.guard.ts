import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map } from "rxjs/operators";
import { AuthService } from "../auth.service";
import { User } from 'src/app/models/user';
import { IssueService } from 'src/app/api/services/issue.service';


@Injectable({
    providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
    constructor(private auth: AuthService,
                private issueService: IssueService,
                private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree
    {
        let isStaff: Observable<boolean> = this.auth.isStaff();

        let issueCreator: Observable<User> = this.issueService.loadIssueWithDetails(route.params.id)
            .pipe(map((issue) => issue.creator));

        let currentUser: Observable<User> = this.auth.getUser();

        let joinedObservables = forkJoin([isStaff, issueCreator, currentUser]);

        return (
            joinedObservables
                // If the current user has staff permissions or is the creator of the issue, return true, otherwise, returns an UrlTree to redirect to the login page
                .pipe(map(([isStaff, creator, currentUser]) => ((isStaff || creator === currentUser) ? true : this.router.parseUrl("/login"))))
        );
    }
}