import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IssueService } from 'src/app/api/services/issue.service';
import { Issue, Point } from 'src/app/models/issue';
import { IssueCommentService } from 'src/app/api/services/issue-comment.service';

@Component({
  selector: 'app-issue-detail',
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.scss']
})
export class IssueDetailComponent implements OnInit {

  issue: Issue = new Issue();
  issuePoint: Point[] = [];
  comments: Comment[] = [];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private issueService: IssueService,
              private issueCommentService: IssueCommentService) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getIssue(id);
      this.getCommentsForIssue(id);
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

  getCommentsForIssue(id: string): void {
    this.issueCommentService.loadAllCommentsForIssue(id)
    .subscribe({
      next: (comments: Comment[]) => {
        this.comments = comments;
      },
       //error: err => this.errorMessage = err
    });
  }
}
