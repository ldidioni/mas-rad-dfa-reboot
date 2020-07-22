import { Component, OnInit } from '@angular/core';
import { IssueService } from 'src/app/api/services/issue.service';
import { Issue, Point } from 'src/app/models/issue';
import { Router } from '@angular/router';


@Component({
  selector: 'app-issue-list',
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.scss']
})
export class IssueListComponent implements OnInit {

  issues: Issue[] = [];
  issuePoints: Point[] = [];
  displayedColumns: string[] = ['creator', 'type', 'state', 'description', 'assignee', 'createdAt', 'updatedAt', 'details'];

  constructor(private issueService: IssueService,
              private router: Router) { }

  ngOnInit(): void {
    this.getAllIssues();
    //this.issuePoints = [];
  }

  getAllIssues(): void {
    this.issueService.loadAllIssuesWithDetails()
        .subscribe({
            next: (issues: Issue[]) => {
              this.issues = issues;
              this.issuePoints = issues.map((issue: Issue) => new Point(issue.location.coordinates));
              console.log(this.issues);
              console.log(this.issuePoints);},
            //error: err => this.errorMessage = err
        });
  }

  editIssue(issue: Issue): void {
    this.issueService.updateIssue(issue)
        .subscribe({
          next: () => this.onSaveComplete(),
          //error: err => this.errorMessage = err
      });
  }

 /*  onDetailClick(id: string) {
    this.router.navigateByUrl(`issue/{id}`);
  } */

  onSaveComplete(): void {

  }

}
