import { Component, OnInit, AfterViewInit, DoCheck } from '@angular/core';
import { IssueService } from 'src/app/api/services/issue.service';
import { Issue, Point } from 'src/app/models/issue';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from 'src/app/security/auth.service';
import { User } from 'src/app/models/user';
import { Observable, concat, of } from 'rxjs';
import { MessagingService } from 'src/app/shared/services/messaging.service';

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

  issues: Issue[];
  totalNbOfPages: number;
  currentPage: number;
  issuePoints: Point[];
  displayedColumns: string[] = ['creator', 'type', 'state', 'description', 'assignee', 'createdAt', 'updatedAt', 'details', 'editIssue', 'deleteIssue'];

  issueTypes: string[];
  issueStates: string[];
  issueTags: string[];
  issueTypeObjects: any[];
  issueCreatorObjects: any;
  issueCreators: any;
  states: string[];
  tags: string[];
  obs: Observable<any>[];

  currentUser: User;

  queryObject: any;

  issuesFilterForm: FormGroup;
  issuesSearchForm: FormGroup;

  initialFetch: boolean;

  searchString = "";

  constructor(private issueService: IssueService,
              private auth: AuthService,
              private messagingService: MessagingService,
              private formBuilder: FormBuilder,
              private router: Router)
  {
    this.issues = [];
    this.issuePoints = [];
    this.issueTypes = [];
    this.issueCreators = [];
    this.currentPage = 0;
    this.issueTypeObjects = [];
    this.issueCreatorObjects = [];
    this.states = [];
    this.tags = [];
    this.obs = [];
    this.initialFetch = true;
  }

  ngOnInit(): void
  {
    this.initialFetch = true;
    // Get the current user and assigns it to the dedicated instance variable for permissions checking
    this.auth.getUser().subscribe({
      next: (user) => this.currentUser = user,
      error: (err) => {
        console.warn(`Could not determine current user: ${err.message}`);
      },
    });

    // Get all issues and populate instance variable with fetched data
    this.getAllIssues();

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
                        creator: {"$in": [ ]},
                        state: {"$in": [ ]}
                      };

    this.onChanges();
  }

  /**
   * Method which gets all issues and populate instance variable with fetched data
   * in order to fill the table and select in with the issues' attributes values
   */
  getAllIssues(): void
  {
    this.resetAll();

    this.issueService.getTotalNumberOfPages()
      .subscribe(nb =>
        {
          this.totalNbOfPages = nb;
          console.log('NbOfPages = ' + this.totalNbOfPages);

          for(let index = 1 ; index <= this.totalNbOfPages ; index++)
          {
            this.obs.push(this.issueService.loadIssuesWithDetailsForPageOfIndex(index));
          }
          concat(...this.obs)
            .subscribe({
              next: (issues: Issue[]) => this.processIssues(issues),
              error: () => this.messagingService.open('Could not fetch issues!')
          });
        });
  }

  resetAll()
  {
    this.obs = [];
    this.issues = [];
    this.issuePoints = [];
    //this.issueTypeObjects = [];
    //this.issueCreatorObjects = [];
    //this.issueCreators = [];
    //this.issueStates = [];
    //this.issueTags = [];
  }
  /**
   * Method which processes the fetched issues and populate instance variable with respective data
   */
  processIssues(issues: Issue[])
  {
    this.issues.push(...issues);
    this.issues = this.issues.slice();  // Force change detection by triggering a change of reference

    // For sake of displaying the markers on the map
    this.issuePoints.push(...issues.map((issue: Issue) => new Point(issue.location.coordinates)));
    this.issuePoints = this.issuePoints.slice();

    // To populate the issue type select
    if(this.initialFetch)
    {
      this.issueTypeObjects.push(...issues.map((issue: Issue) => issue.issueType));
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
      this.issueTypes = this.issueTypes.slice();  // Force change detection by triggering a change of reference

      console.log(this.issueTypes);

      // To populate creator filter (search type)
      this.issueCreatorObjects.push(...issues.map((issue: Issue) => issue.creator));
      this.issueCreatorObjects = this.issueCreatorObjects.sort(compareNames); // sorts alphabetically
      this.issueCreatorObjects = this.issueCreatorObjects.slice();

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

      // Eliminate duplicate issue creator IDs
      this.issueCreators = [...new Set(this.issueCreators)];

      console.log(this.issueCreators);

      // To populate issue state filter
      this.states.push(...issues.map((issue: Issue) => issue.state));
      this.issueStates = [...new Set(this.states.sort())]; // makes states unique and sorted
      this.issueStates = this.issueStates.slice();

      // To populate issue tags filter
      let tagArrays = issues.map((issue: Issue) => issue.tags);
      console.log(tagArrays);

      for (let tagArray of tagArrays)
      {
        this.tags.push(...tagArray);
      }
      console.log(this.tags);

      this.issueTags = [...new Set(this.tags.sort())]; // makes tags unique and sorted
      this.issueTags = this.issueTags.slice();

      console.log(this.issueTags);

      // Build the query object to be passed in the payload of the request to the /issues/searches end-point
      this.queryObject["creator"]["$in"] = [...this.issueCreators];
      this.queryObject["issueType"]["$in"] = [...this.issueTypes];
      this.queryObject["state"]["$in"] = [...this.issueStates];
      //this.queryObject["tags"]["$in"] = [...this.issueTags];
    }

    if(this.searchString.length > 0)
    {
      this.issues = this.issues.filter(issue => issue.description.includes(this.searchString));
      this.issuePoints = this.issues.map((issue: Issue) => new Point(issue.location.coordinates));
      this.issuePoints = this.issuePoints.slice();
      console.log(this.issues);
      console.log(this.issuePoints);
    }

    if(this.issuesFilterForm.get("tags").value.length > 0)
      {
        console.log(this.issues);
        this.issues = this.issues.filter(issue => issue.tags.some(tag => this.issuesFilterForm.get("tags").value.indexOf(tag) !== -1));
        this.issues = this.issues.slice();  // Force change detection by triggering a change of reference
        this.issuePoints = this.issues.map((issue: Issue) => new Point(issue.location.coordinates));
        this.issuePoints = this.issuePoints.slice();
        console.log(this.issues);
      }
  }

  /**
   * Method which reacts to changes of input values of the filter form in order to update the query object for filtering
   * and trigger the search request with the updated query object
   */
  onChanges(): void
  {
    this.issuesFilterForm.valueChanges.subscribe(settings => {

      this.initialFetch = false;

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
      // No issue states selected
      if(!settings.issueStates || settings.issueStates.length === 0)
      {
        this.queryObject["state"]["$in"] = [...this.issueStates];
      }
      // Some issue states selected
      else
      {
        this.queryObject["state"]["$in"] = [...settings.issueStates];
      }

      // Perform new search request with the updated query object
      this.search();
    });
  }

  /**
   * Method called upon clicking the submit button of the issuesSearchForm form
   */
  search()
  {
    this.initialFetch = false;

    this.resetAll();

    console.log(this.issues);
    this.searchString = this.issuesSearchForm.get('query').value;

    // trigger a fresh request to the /issues/searches end-point, then filter the issues to keep those
    // whose description matches the search string
    this.issueService.searchGetTotalNumberOfPages(this.queryObject)
      .subscribe(nb =>
        {
          this.totalNbOfPages = nb;
          console.log('NbOfPages = ' + this.totalNbOfPages);

          for(let index = 1 ; index <= this.totalNbOfPages ; index++)
          {
            this.obs.push(this.issueService.searchIssuesForPageOfIndex(this.queryObject, index));
          }
          concat(...this.obs)
            .subscribe({
              next: (issues: Issue[]) => this.processIssues(issues),
              error: () => this.messagingService.open('Could not fetch issues!')
          });
        });
  }

  /**
   * Method called upon clicking the delete button associated to an issue which is identified through its id
   */
  deleteIssue(id: string)
  {
    this.issueService.deleteIssue(id).subscribe({
      next: () => this.getAllIssues(),
      error: (err) => {
        this.messagingService.open('Could not delete issue!')
        console.warn(`Could not delete issue: ${err.message}`);
      },
    });
  }

  /**
   * Method which checks whether the current user has the 'staff' role
   */
  isStaff(): boolean
  {
    return this.currentUser.roles.includes('staff');
  }

  /**
   * Method which checks whether the current user is the author of a specific issue identified through its id
   */
  isAuthor(creator: User): boolean
  {
    return this.currentUser.id === creator.id;
  }
}