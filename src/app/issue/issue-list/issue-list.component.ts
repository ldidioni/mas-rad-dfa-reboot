import { Component, OnInit } from '@angular/core';
import { IssueService } from 'src/app/api/services/issue.service';
import { Issue, Point } from 'src/app/models/issue';


@Component({
  selector: 'app-issue-list',
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.scss']
})
export class IssueListComponent implements OnInit {

  issues: Issue[];
  issuePoints: Point[];
  displayedColumns: string[] = ['id', 'state', 'description', 'createdAt', 'updatedAt'];

  constructor(private issueService: IssueService) { }

  ngOnInit(): void {
    this.getAllIssues();
    //this.issuePoints = [];
  }

  getAllIssues(): void {
    this.issueService.loadAllIssues()
        .subscribe({
            next: (issues: Issue[]) => {
              this.issues = issues;
              this.issuePoints = issues.map((issue: Issue) => new Point(issue.location.coordinates));
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

  onSaveComplete(): void {

  }

}
