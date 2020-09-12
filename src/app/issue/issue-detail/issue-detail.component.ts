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
import { MessagingService } from 'src/app/shared/services/messaging.service';

/**
 * Issue details page
 */
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
              private messagingService: MessagingService,
              public matDialog: MatDialog)
  {
    this.newCommentReq = new IssueCommentRequest();
  }

  ngOnInit(): void {
    // We get the issue id from the respective route parameter,
    // then we query the corresponding issue and the associated comments from the back-end
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.getIssue(this.id);
      this.getCommentsForIssue(this.id);
    }
  }

  /**
   * Method which gets the issue identified through its id and assign its attributes values to the respective instance variable
   */
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
            error: err => this.messagingService.open('Could not retrieve issue!')
        });
  }

  /**
   * Method which gets the commments for the issue identified through its id and assign the queried collection to the respective instance variable
   */
  getCommentsForIssue(id: string): void {
    this.issueCommentService.loadAllCommentsForIssue(id)
    .subscribe({
      next: (comments: IssueComment[]) => {
        this.comments = comments;
      },
      error: () => this.messagingService.open('Could not retrieve comments for issue!')
    });
  }

  /**
   * Method called upon clicking the new comment form submit button
   */
  submitComment(form: NgForm)
  {
    // Only do something if the form is valid
    if (form.valid) {
      // Send the POST request to the API.
      this.issueCommentService.createCommentForIssue(this.id, this.newCommentReq.text).subscribe({
        next: () => this.router.navigateByUrl("/issues"),
        error: (err) => {
          this.messagingService.open('Could not submit comment!');
          console.warn(`Could not submit comment: ${err.message}`);
        },
      });
    }
  }

  /**
   * Method called upon clicking a thumbnail card to display a modal containing an enlarged version of the image
   */
  openModal(imageUrl: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.id = "modal-component";
    dialogConfig.height = "350px";
    dialogConfig.width = "600px";
    dialogConfig.data = {'imageUrl': imageUrl};
    // https://material.angular.io/components/dialog/overview
    const modalDialog = this.matDialog.open(ImageModalComponent, dialogConfig);
  }
}
