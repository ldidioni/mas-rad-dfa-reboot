import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from "@angular/forms";

import { IssueService } from 'src/app/api/services/issue.service';
import { Issue, Point } from 'src/app/models/issue';
import { IssueCommentService } from 'src/app/api/services/issue-comment.service';
import { IssueComment } from 'src/app/models/issue-comment';
import { IssueCommentRequest } from 'src/app/models/issue-comment-request';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ImageModalComponent } from '../image-modal/image-modal.component';

@Component({
  selector: 'app-issue-detail',
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.scss']
})
export class IssueDetailComponent implements OnInit {

  id: string;
  issue: Issue = new Issue();
  issuePoint: Point[] = [];
  comments: IssueComment[] = [];
  newCommentReq: IssueCommentRequest;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private issueService: IssueService,
              private issueCommentService: IssueCommentService,
              public matDialog: MatDialog) {
    this.newCommentReq = new IssueCommentRequest();
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.getIssue(this.id);
      this.getCommentsForIssue(this.id);
    }
  }

  getIssue(id: string): void {
    this.issueService.loadIssueWithDetails(id)
        .subscribe({
            next: (issue: Issue) => {
              this.issue = issue;
              this.issuePoint = [new Point(issue.location.coordinates)];
              //this.issuePoint.push(new Point(issue.location.coordinates));
              console.log(this.issue);
              console.log(this.issuePoint);
            },
            //error: err => this.errorMessage = err
        });
  }

  getCommentsForIssue(id: string): void {
    this.issueCommentService.loadAllCommentsForIssue(id)
    .subscribe({
      next: (comments: IssueComment[]) => {
        this.comments = comments;
      },
       //error: err => this.errorMessage = err
    });
  }

  submitComment(form: NgForm)
  {
    // Only do something if the form is valid
    if (form.valid) {
      // Hide any previous login error.
      //this.newCommentError = false;

      // Perform the authentication request to the API.
      this.issueCommentService.createCommentForIssue(this.id, this.newCommentReq.text).subscribe({
        next: () => this.router.navigateByUrl("/"),
        error: (err) => {
          //this.newCommentError = true;
          console.warn(`Could not submit comment: ${err.message}`);
        },
      });
    }
  }

  openModal(imageUrl: string) {
    const dialogConfig = new MatDialogConfig();
    // The user can't close the dialog by clicking outside its body
    //dialogConfig.disableClose = true;
    dialogConfig.id = "modal-component";
    dialogConfig.height = "350px";
    dialogConfig.width = "600px";
    dialogConfig.data = {'imageUrl': imageUrl};
    // https://material.angular.io/components/dialog/overview
    const modalDialog = this.matDialog.open(ImageModalComponent, dialogConfig);
  }
}
