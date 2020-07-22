import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IssueService } from 'src/app/api/services/issue.service';
import { Issue, Point } from 'src/app/models/issue';

@Component({
  selector: 'app-issue-detail',
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.scss']
})
export class IssueDetailComponent implements OnInit {

  issue: Issue = new Issue();
  issuePoint: Point[] = [];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private issueService: IssueService) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getIssue(id);
    }
  }

  getIssue(id: string): void {
    this.issueService.loadIssue(id)
        .subscribe({
            next: (issue: Issue) => {
              this.issue = issue;
              this.issuePoint.push(new Point(issue.location.coordinates));
              console.log(this.issue);
              console.log(this.issuePoint);
            },
            //error: err => this.errorMessage = err
        });
  }

}
