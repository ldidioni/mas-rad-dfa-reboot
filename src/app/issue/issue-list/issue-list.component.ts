import { Component, OnInit } from '@angular/core';
import { IssueService } from 'src/app/api/services/issue.service';
import { Issue, Point } from 'src/app/models/issue';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from 'src/app/security/auth.service';
import { User } from 'src/app/models/user';

/**
 * Function that sorts strings (used for options in select)
 */
function compareNames(objectA: any, objectB: any) {
  if (objectA.name < objectB.name){
    return -1;
  }
  if (objectA.name > objectB.name){
    return 1;
  }
  return 0;
}

/**
 * Issue list page
 */
@Component({
  selector: 'app-issue-list',
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.scss']
})
export class IssueListComponent implements OnInit {

  issues: Issue[] = [];
  issuePoints: Point[] = [];
  displayedColumns: string[] = ['creator', 'type', 'state', 'description', 'assignee', 'createdAt', 'updatedAt', 'details', 'editIssue', 'deleteIssue'];

  issueTypes: string[];
  issueStates: string[];
  issueTags: string[];
  issueTypeObjects: any[];
  issueCreatorObjects: any;
  issueCreators: any;

  currentUser: User;

  queryObject: any;

  issuesFilterForm: FormGroup;
  issuesSearchForm: FormGroup;

  searchString = "";

  constructor(private issueService: IssueService,
              private auth: AuthService,
              private formBuilder: FormBuilder,
              private router: Router)
  {
    this.issueTypes = [];
    this.issueCreators = [];
  }

  ngOnInit(): void {

    this.auth.getUser().subscribe({
      next: (user) => this.currentUser = user,
      error: (err) => {
        console.warn(`Could not determine current user: ${err.message}`);
      },
    });

    this.getAllIssues();
    //this.issuePoints = [];

    this.issuesFilterForm = this.formBuilder.group({
      issueTypes:  '',
      issueCreators:  '',
      issueStates: '',
      tags:        '',
      location:    ''
    });

    this.issuesSearchForm = this.formBuilder.group({
      query:  ''
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

              console.log(this.issuePoints);

              // To populate issue type filter (search type)
              this.issueTypeObjects = issues.map((issue: Issue) => issue.issueType);
              this.issueTypeObjects = this.issueTypeObjects.sort(compareNames);

              // Eliminate duplicate entries
              this.issueTypeObjects = Object.values(
                this.issueTypeObjects.reduce( (c, e) => {
                  if (!c[e.name]) c[e.name] = e;
                  return c;
                }, {})
              );

              console.log(this.issueTypeObjects);

              // Collect all issue type IDs to perform original query for issues without any filtering
              for(let issueTypeObject of this.issueTypeObjects)
              {
                this.issueTypes.push(issueTypeObject.id);
              }
              this.issueTypes = [...new Set(this.issueTypes)];

              console.log(this.issueTypes);

              // To populate creator filter (search type)
              this.issueCreatorObjects = issues.map((issue: Issue) => issue.creator);
              this.issueCreatorObjects = this.issueCreatorObjects.sort(compareNames);

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
              this.issueStates = [...new Set(states.sort())];

              // To populate issue tags filter
              let tagArrays = issues.map((issue: Issue) => issue.tags);
              console.log(tagArrays);
              let tags: string[] = [];

              for (let tagArray of tagArrays)
              {
                tags.push(...tagArray);
              }
              console.log(tags);

              this.issueTags = [...new Set(tags.sort())];
              console.log(this.issueTags);

              this.queryObject["creator"]["$in"] = [...this.issueCreators];
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
      console.log(settings.issueTypes);
      console.log(settings.issueCreators);
      // No issue types selected
      if(!settings.issueTypes || settings.issueTypes.length === 0)
      {
        this.queryObject["issueType"]["$in"] = [...this.issueTypes];
        //console.log("no filtering");
      }
      // Some issue types selected
      else
      {
        this.queryObject["issueType"]["$in"] = [...settings.issueTypes];
        //console.log("filtering!!!");
      }
      // No creators selected
      if(!settings.issueCreators || settings.issueCreators.length === 0)
      {
        this.queryObject["creator"]["$in"] = [...this.issueCreators];
      }
      // Some creators selected
      else
      {
        this.queryObject["creator"]["$in"] = [...settings.issueCreators];
      }

      this.searchIssues(this.queryObject);

/*      if(settings.issueTags)
      {
        this.queryObject["tags"]["$in"] = [...settings.issueTags];
      } */
      //console.log(this.queryObject);
      //this.searchIssues(this.queryObject);

    });
  }

  search()
  {
    this.searchString = this.issuesSearchForm.get('query').value;

    this.issueService.searchIssues(this.queryObject)
      .subscribe({
          next: (issues: Issue[]) => {
            this.issues = issues;
            this.issuePoints = this.issues.map((issue: Issue) => new Point(issue.location.coordinates));

            if(this.searchString.length > 0)
            {
              console.log(this.issues);
              this.issues = this.issues.filter(issue => issue.description.includes(this.searchString));
              console.log(this.issues);
            }
          }
      });
  }

  searchIssues(queryObject: any)
  {
    this.issueService.searchIssues(queryObject)
      .subscribe({
          next: (issues: Issue[]) => {
            this.issues = issues;
            this.issuePoints = this.issues.map((issue: Issue) => new Point(issue.location.coordinates));

            console.log(this.issuesFilterForm.get("issueStates").value);
            console.log(this.issuesFilterForm.get("tags").value);

            if(this.issuesFilterForm.get("issueStates").value.length > 0)
            {
              console.log(this.issues);
              this.issues = this.issues.filter(issue => [...this.issuesFilterForm.get("issueStates").value].includes(issue.state));
              console.log(this.issues);
            }
            if(this.issuesFilterForm.get("tags").value.length > 0)
            {
              console.log(this.issues);
              this.issues = this.issues.filter(issue => issue.tags.some(tag => [...this.issuesFilterForm.get("tags").value].indexOf(tag) !== -1));
              console.log(this.issues);
            }
          }
        });
  }


/*   searchIssues(event: LeafletMouseEvent, radius: number) {
    this.issuePoints = this.issuePoints.filter((issuePoint: Point) => {
      event.latlng.distanceTo(L.latLng(
        issuePoint.coordinates[1],
        issuePoint.coordinates[0])) < radius;
    });
  } */

 /*  onDetailClick(id: string) {
    this.router.navigateByUrl(`issue/{id}`);
  } */

  deleteIssue(id: string)
  {
    this.issueService.deleteIssue(id).subscribe({
      next: () => this.getAllIssues(),
      error: (err) => {
        console.warn(`Could not delete issue: ${err.message}`);
      },
    });
  }

  isStaff(): boolean
  {
/*     this.auth.isStaff().subscribe({
      next: (isStaff) => isStaff,
      error: (err) => {
        console.warn(`Could not determine if current user has staff permissions: ${err.message}`);
      },
    }); */
    return this.currentUser.roles.includes('staff');
  }

  isAuthor(creator: User): boolean
  {
    return this.currentUser.id === creator.id;
/*     this.auth.getUser().subscribe({
      next: (user) => {console.log(user); return user.id === creator.id},
      error: (err) => {
        console.warn(`Could not determine if current user is creator of issue: ${err.message}`);
      },
    }); */
  }

}
