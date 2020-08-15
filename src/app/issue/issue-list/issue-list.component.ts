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
  issueTypeObjects: any[];
  issueCreatorObjects: any;
  issueCreators: any;

  queryObject: any;

  issuesFilterForm: FormGroup;


  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private router: Router)
  {
    this.issueTypes = [];
    this.issueCreators = [];
  }

  ngOnInit(): void {
    this.getAllIssues();
    //this.issuePoints = [];

    this.issuesFilterForm = this.formBuilder.group({
      issueTypes:  '',
      issueCreators:  '',
      issueStates: '',
      tags:        '',
      location:    ''
    });

    this.queryObject = {issueType: {"$in": [ ]},
                        creator: {"$in": [ ]}
                      };

    this.onChanges();
  }

  getAllIssues(): void {
    this.issueService.loadAllIssuesWithDetails()
        .subscribe({
            next: (issues: Issue[]) => {
              this.issues = issues;
              this.issuePoints = issues.map((issue: Issue) => new Point(issue.location.coordinates));

              // To populate issue type filter (search type)
              this.issueTypeObjects = issues.map((issue: Issue) => issue.issueType);

              this.issueTypeObjects = Object.values(
                this.issueTypeObjects.reduce( (c, e) => {
                  if (!c[e.name]) c[e.name] = e;
                  return c;
                }, {})
              );

              console.log(this.issueTypeObjects);

              for(let issueTypeObject of this.issueTypeObjects)
              {
                this.issueTypes.push(issueTypeObject.id);
              }
              this.issueTypes = [...new Set(this.issueTypes)];

              console.log(this.issueTypes);

              // To populate creator filter (search type)
              this.issueCreatorObjects = issues.map((issue: Issue) => issue.creator);

              this.issueCreatorObjects = Object.values(
                this.issueCreatorObjects.reduce( (c, e) => {
                  if (!c[e.name]) c[e.name] = e;
                  return c;
                }, {})
              );

              console.log(this.issueCreatorObjects);

              for(let issueCreatorObject of this.issueCreatorObjects)
              {
                this.issueCreators.push(issueCreatorObject.id);
              }
              this.issueCreators = [...new Set(this.issueCreators)];

              console.log(this.issueCreators);

              // To populate issue state filter
              let states = issues.map((issue: Issue) => issue.state);
              this.issueStates = [...new Set(states)];

              // To populate issue tags filter
              let tags = issues.map((issue: Issue) => issue.tags);
              this.issueTags = [...new Set(...tags)];

              this.queryObject["issueType"]["$in"] = [...this.issueTypes];
              //this.queryObject["state"]["$in"] = [...this.issueStates];
              //this.queryObject["tags"]["$in"] = [...this.issueTags];

              console.log(this.issues);
              console.log(this.issuePoints);},
            //error: err => this.errorMessage = err
        });
  }

  onChanges(): void {
    this.issuesFilterForm.valueChanges.subscribe(settings => {
      if(settings.issueTypes)
      {
        this.queryObject["issueType"]["$in"] = [...settings.issueTypes];
      }
      if(settings.issueCreators)
      {
        this.queryObject["creator"]["$in"] = [...settings.issueCreators];
      }
/*       if(settings.issueStates)
      {
        this.queryObject["state"]["$in"] = [...settings.issueStates];
      }
      if(settings.issueTags)
      {
        this.queryObject["tags"]["$in"] = [...settings.issueTags];
      } */
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
