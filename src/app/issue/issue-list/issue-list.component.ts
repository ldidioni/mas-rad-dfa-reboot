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

  ngOnInit(): void
  {
    // Get the current user and assigns it to the dedicated instance variable for permissions checking
    this.auth.getUser().subscribe({
      next: (user) => this.currentUser = user,
      error: (err) => {
        console.warn(`Could not determine current user: ${err.message}`);
      },
    });

    // Get all issues
    this.getAllIssues();
    //this.issuePoints = [];

    // Create a form to store the different filters
    this.issuesFilterForm = this.formBuilder.group({
      issueTypes:  '',
      issueCreators:  '',
      issueStates: '',
      tags:        '',
      location:    ''
    });

    // Create a form to store the free search field
    this.issuesSearchForm = this.formBuilder.group({
      query:  ''
    });

    // The query object to be passed in the payload of the request to the /issues/searches end-point
    this.queryObject = {issueType: {"$in": [ ]},
                        creator: {"$in": [ ]}
                      };

    this.onChanges();
  }

  /**
   * Method which gets all issues and fill the table and select in with the issues' attributes values
   */
  getAllIssues(): void {
    this.issueService.loadAllIssuesWithDetails()
        .subscribe({
            next: (issues: Issue[]) => {
              this.issues = issues;

              // For sake of displaying the markers on the map
              this.issuePoints = issues.map((issue: Issue) => new Point(issue.location.coordinates));

              console.log(this.issuePoints);

              // To populate the issue type select
              this.issueTypeObjects = issues.map((issue: Issue) => issue.issueType);
              this.issueTypeObjects = this.issueTypeObjects.sort(compareNames); // sorts alphabetically

              // Eliminate duplicate issue type entries based on their name attribute
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
              this.issueCreatorObjects = this.issueCreatorObjects.sort(compareNames); // sorts alphabetically

              // Eliminate duplicate issue creator entries based on their name attribute
              this.issueCreatorObjects = Object.values(
                this.issueCreatorObjects.reduce( (c, e) => {
                  if (!c[e.name]) c[e.name] = e;
                  return c;
                }, {})
              );

              console.log(this.issueCreatorObjects);

              // Collect all issue creator IDs to perform original query for issues without any filtering
              for(let issueCreatorObject of this.issueCreatorObjects)
              {
                this.issueCreators.push(issueCreatorObject.id);
              }
              this.issueCreators = [...new Set(this.issueCreators)];

              console.log(this.issueCreators);

              // To populate issue state filter
              let states = issues.map((issue: Issue) => issue.state);
              this.issueStates = [...new Set(states.sort())]; // makes states unique and sorted

              // To populate issue tags filter
              let tagArrays = issues.map((issue: Issue) => issue.tags);
              console.log(tagArrays);
              let tags: string[] = [];

              for (let tagArray of tagArrays)
              {
                tags.push(...tagArray);
              }
              console.log(tags);

              this.issueTags = [...new Set(tags.sort())]; // makes tags unique and sorted
              console.log(this.issueTags);

              // Build the query object to be passed in the payload of the request to the /issues/searches end-point
              this.queryObject["creator"]["$in"] = [...this.issueCreators];
              this.queryObject["issueType"]["$in"] = [...this.issueTypes];
              //this.queryObject["state"]["$in"] = [...this.issueStates];
              //this.queryObject["tags"]["$in"] = [...this.issueTags];

              console.log(this.issues);
              console.log(this.issuePoints);},
            //error: err => this.errorMessage = err
        });
  }

  /**
   * Method which reacts to changes of input values of the filter form in order to update the query object for filtering
   * and trigger the search request with the updated query object
   */
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

      // Perform new search request with the updated query object
      this.searchIssues(this.queryObject);

/*      if(settings.issueTags)
      {
        this.queryObject["tags"]["$in"] = [...settings.issueTags];
      } */
      //console.log(this.queryObject);
      //this.searchIssues(this.queryObject);

    });
  }

  /**
   * Method called upon clicking the submit button of the issuesSearchForm form
   */
  search()
  {
    this.searchString = this.issuesSearchForm.get('query').value;

    // trigger a fresh request to the /issues/searches end-point, then filter the issues to keep those
    // whose description matches the search string
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

  /**
   * Method called upon clicking the delete button associated to an issue which is identified through its id
   */
  deleteIssue(id: string)
  {
    this.issueService.deleteIssue(id).subscribe({
      next: () => this.getAllIssues(),
      error: (err) => {
        console.warn(`Could not delete issue: ${err.message}`);
      },
    });
  }

  /**
   * Method which checks whether the current user has the 'staff' role
   */
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

  /**
   * Method which checks whether the current user is the author of a specific issue identified through its id
   */
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
