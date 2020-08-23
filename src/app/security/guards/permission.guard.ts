import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { AuthService } from "../auth.service";
import { User } from 'src/app/models/user';
import { IssueService } from 'src/app/api/services/issue.service';

/**
 * Guard which only grants access to a issue-specific route provided the current user has either staff permission
 * or is the author of the issue. The issue is identified by the means of its id which is a route parameter
 */
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

        return combineLatest(isStaff, issueCreator, currentUser)    // emit the last emitted value from each observable, which do not need to complete (contrary to forJoin)
                .pipe(map(([isStaff, creator, currentUser]) => {
                    return (isStaff || creator.id === currentUser.id) ? true : this.router.parseUrl("/issues");
                })
        );
    }
}