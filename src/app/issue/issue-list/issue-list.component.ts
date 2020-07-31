import { Component, OnInit } from '@angular/core';
import { IssueService } from 'src/app/api/services/issue.service';
import { Issue, Point, state } from 'src/app/models/issue';
import { Router } from '@angular/router';
import { IssueType } from 'src/app/models/issue-type';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { LeafletMouseEvent } from 'leaflet';
import * as L from 'leaflet';


@Component({
  selector: 'app-issue-list',
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.scss']
})
export class IssueListComponent implements OnInit {

  issues: Issue[] = [];
  issuePoints: Point[] = [];
  displayedColumns: string[] = ['creator', 'type', 'state', 'description', 'assignee', 'createdAt', 'updatedAt', 'details', 'editIssue'];

  issueTypes: string[];
  issueStates: string[];
  issueTags: string[];

  queryObject: any;

  issuesFilterForm: FormGroup;

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private router: Router) { }

  ngOnInit(): void {
    this.getAllIssues();
    //this.issuePoints = [];

    this.issuesFilterForm = this.formBuilder.group({
      issueTypes:  '',
      issueStates: '',
      tags:        '',
      location:    ''
    });

    this.queryObject = {state: {"$in": [ ]},
                        type: {"$in": [ ]},
                        tags: {"$in": [ ]}};
    this.onChanges();
  }

  getAllIssues(): void {
    this.issueService.loadAllIssuesWithDetails()
        .subscribe({
            next: (issues: Issue[]) => {
              this.issues = issues;
              this.issuePoints = issues.map((issue: Issue) => new Point(issue.location.coordinates));

              // To populate issue type filter
              let issueTypeNames = issues.map((issue: Issue) => issue.issueType.name);
              this.issueTypes = [...new Set(issueTypeNames)];

              // To populate issue state filter
              let states = issues.map((issue: Issue) => issue.state);
              this.issueStates = [...new Set(states)];

              // To populate issue tags filter
              let tags = issues.map((issue: Issue) => issue.tags);
              this.issueTags = [...new Set(...tags)];

              this.queryObject["type"]["$in"] = [...this.issueTypes];
              this.queryObject["state"]["$in"] = [...this.issueStates];
              this.queryObject["tags"]["$in"] = [...this.issueTags];

              console.log(this.issues);
              console.log(this.issuePoints);},
            //error: err => this.errorMessage = err
        });
  }

  onChanges(): void {
    this.issuesFilterForm.valueChanges.subscribe(settings => {
      if(settings.issueTypes)
      {
        this.queryObject["type"]["$in"] = [...settings.issueTypes];
      }
      if(settings.issueStates)
      {
        this.queryObject["state"]["$in"] = [...settings.issueStates];
      }
      if(settings.issueTags)
      {
        this.queryObject["tags"]["$in"] = [...settings.issueTags];
      }
      console.log(this.queryObject);
      this.filterIssues(this.queryObject);

    });
  }

  filterIssues(queryObject: any) {
    this.issueService.searchIssues(queryObject)
      .subscribe({
          next: (issues: Issue[]) => {
            this.issues = issues;
            this.issuePoints = issues.map((issue: Issue) => new Point(issue.location.coordinates));
          }
        });
  }

  searchIssues(event: LeafletMouseEvent, radius: number) {
    this.issuePoints = this.issuePoints.filter((issuePoint: Point) => {
      event.latlng.distanceTo(L.latLng(
        issuePoint.coordinates[1],
        issuePoint.coordinates[0])) < radius;
    });
  }

 /*  onDetailClick(id: string) {
    this.router.navigateByUrl(`issue/{id}`);
  } */

  onSaveComplete(): void {

  }

}
