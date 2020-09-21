import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, FormControl } from '@angular/forms';
import { IssueNewRequest } from 'src/app/models/issue-new-request';
import { Point, Issue } from 'src/app/models/issue';
import { IssueService } from 'src/app/api/services/issue.service';
import { IssueTypeService } from 'src/app/api/services/issue-type.service';
import { IssueType } from 'src/app/models/issue-type';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagingService } from 'src/app/shared/services/messaging.service';

/**
 * Custom form validator which checks for every tags in the value array to have acceptable lengths
 */
function checkTagLength(c: AbstractControl): {[key: string]: boolean} | null {

  const hasExpectedLength = (tag: string) => 2 <= tag.length && tag.length <= 25;

  // every tags have acceptable lengths
  if(c.value != null && c.value.every(hasExpectedLength)){
    return (null);
  }
  // at least one tag does not have an acceptable length
  return {'tagLength': true};
}

/**
 * Issue edition page
 */
@Component({
  selector: 'app-issue-edit',
  templateUrl: './issue-edit.component.html',
  styleUrls: ['./issue-edit.component.scss']
})
export class IssueEditComponent implements OnInit {

  id: string;
  issue: Issue = new Issue();
  issuePoint: Point[] = [];
  editIssueForm: FormGroup;
  issueNewRequest: IssueNewRequest; // the issue request object aimed at being sent to the API
  issueTypes: IssueType[];

  mapClicked: boolean;

  tags: string[];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]; // keys that delimit the different tags in the mat-chip element

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private issueTypeService: IssueTypeService,
              private messagingService: MessagingService,
              private issueService: IssueService,
              private changeDetectorRef: ChangeDetectorRef)
  {
    this.tags = [];
    // We initialize the issue request object aimed at being sent to the API
    this.issueNewRequest = new IssueNewRequest();
    this.mapClicked = false;
  }

  ngOnInit(): void
  {
    // we get the list of issue types to populate the options list of the respective select
    this.getAllIssueTypes();

    // We initialize the issue edition form
    this.editIssueForm = this.formBuilder.group({
      description:  ['', [Validators.required, Validators.maxLength(1000)]],
      issueType:    ['', [Validators.required]],
      imageUrls:    this.formBuilder.array([this.buildImageUrl()]),
      tags:         [this.tags, [Validators.required, checkTagLength]],
      location:     ['', [Validators.required]]
    });

    // Enables UI update following changes of 'location' form control value
    this.editIssueForm.valueChanges.subscribe( () => {
      this.changeDetectorRef.detectChanges()
    });

    // We get the issue id from the respective route parameter, then we query the corresponding issue from the back-end to fill the form in
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.getIssue(this.id);
    }

/*     this.editIssueForm.get('issueType').valueChanges.subscribe(item => {
      this.issueTypes = item.issueTypes
    }); */
  }

  /**
   * Method which gets the issue identified through its id and fill the form in with the issue's attributes values
   */
  getIssue(id: string): void {
    this.issueService.loadIssueWithDetails(id)
        .subscribe({
            next: (issue: Issue) => {
              this.issue = issue;
              this.issuePoint = [new Point(issue.location.coordinates)];
              //this.issuePoint.push(new Point(this.issue.location.coordinates));
              this.editIssueForm.get('issueType').setValue(this.issue.issueTypeHref);
              this.editIssueForm.get('description').setValue(this.issue.description);

              let control: FormControl = new FormControl(this.issue.imageUrl, Validators.required);
              this.editIssueForm.registerControl('imageUrls', new FormArray([control]));

              //this.imageUrls.push(new FormControl(this.issue.imageUrl, Validators.required));
              //const imageUrls = this.editIssueForm.get('imageUrls') as FormArray;
              this.imageUrls.setControl(0, new FormControl(this.issue.imageUrl, Validators.required));

              for(const additionalImageUrl of this.issue.additionalImageUrls) {
                const imageUrls = this.editIssueForm.get('imageUrls') as FormArray;
                imageUrls.push(new FormControl(additionalImageUrl, Validators.required));
              }

              this.tags = this.issue.tags;
              this.editIssueForm.controls['tags'].setValue(this.issue.tags);

              this.editIssueForm.get('location').setValue(this.issue.location);

              console.log(this.issue);
              console.log(this.issuePoint);
            },
            error: () => this.messagingService.open('Could not retrieve issue!')
        });
  }

  /**
   * Generate a new form control to input an image URL.
   * Called at time of initializing the newIssueForm and upon clicking the "Add image" button
   */
  buildImageUrl(): FormControl
  {
    return new FormControl(
      '', [Validators.required, Validators.maxLength(500), Validators.pattern('^https?://(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:/[^/#?]+)+\.(?:jpg|gif|png)$')]);
  }

  get imageUrls(): FormArray
  {
    if(this.editIssueForm) {
      return <FormArray>this.editIssueForm.get('imageUrls');
    }
    return null;
  }

  /**
   * Method called upon clicking the "Add image" button
   */
  addImageUrl(): void {
    this.imageUrls.push(this.buildImageUrl());
  }

  /**
   * Method which gets the list of all existing issue types and assigns it to the dedicated instance variable
   */
  getAllIssueTypes(): void {
    this.issueTypeService.loadAllIssueTypes()
        .subscribe({
            next: (issueTypes: IssueType[]) => this.issueTypes = issueTypes,
            error: () => this.messagingService.open('Could not populate issue types list!')
        });
  }

  /**
   * Method called upon pressing one of the defined separator keys in the mat-chip element
   */
  addTag(event: MatChipInputEvent) {
    const input = event.input;
    const value = event.value;
    if ((value.trim() !== '')) {
      this.editIssueForm.controls['tags'].setErrors(null);   // 1
      const tempEmails = this.editIssueForm.controls['tags'].value; // 2
      tempEmails.push(value.trim());
      this.editIssueForm.controls['tags'].setValue(tempEmails);     // 3
      if (this.editIssueForm.controls['tags'].valid) {              // 4
        this.editIssueForm.controls['tags'].markAsDirty();
        input.value = '';                                    // 5
      } else {
        const index = this.editIssueForm.controls['tags'].value.findIndex(value1 => value1 === value.trim());
        if (index !== -1) {
          this.editIssueForm.controls['tags'].value.splice(index, 1);           // 6
        }
      }
    } else {
      this.editIssueForm.controls['tags'].updateValueAndValidity();  // 7
    }
  }

  /* removeTag(tag: string): void {
    const index = this.tags.value.indexOf(tag);

    if (index >= 0) {
      this.tags.value.splice(index, 1);
      this.tags.updateValueAndValidity();
    }
  } */

  /**
   * Method called upon clicking the delete button of a tag listed in the mat-chip element
   */
  removeTag(tag: string): void {
    //let controller = this.editIssueForm.controls['tags'];
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
      this.editIssueForm.controls['tags'].updateValueAndValidity();
      this.editIssueForm.controls['tags'].markAsDirty();
    }
  }

  /**
   * Method called upon clicking the delete button associated with an image URL input field
   */
  removeImageUrl(index: number): void {
    this.imageUrls.removeAt(index);
  }

  /**
   * Method called upon clicking the form submit button
   */
  reportIssue(): void {
    if (this.editIssueForm.valid) {
      if (this.editIssueForm.dirty) {

        // We build the issue request object to be sent to the API
        this.issueNewRequest.issueTypeHref = this.editIssueForm.get('issueType').value;
        this.issueNewRequest.description = this.editIssueForm.get('description').value;
        this.issueNewRequest.imageUrl = this.editIssueForm.get('imageUrls').value[0] ;
        this.issueNewRequest.additionalImageUrls = this.editIssueForm.get('imageUrls').value.slice(1) ;
        this.editIssueForm.controls['tags'].markAsTouched();
        this.issueNewRequest.tags = this.editIssueForm.controls['tags'].value ;
        this.issueNewRequest.location = this.editIssueForm.get('location').value;

        console.log(this.issueNewRequest);

        // We send the issue request object to the back-end
        this.issueService.updateIssue(this.id, this.issueNewRequest)
          .subscribe({
            next: () => this.onCreationComplete(),
            error: () => this.messagingService.open('Could not update issue!')
          });
      } else {
        this.onCreationComplete();
      }
    } else {
      this.messagingService.open('Please correct the validation errors.');
    }
  }

  /**
   * Method called upon sending the request object to the back-end
   */
  onCreationComplete(): void
  {
    this.messagingService.open('Issue successfully updated.');
    // Reset the form to clear the flags
    this.editIssueForm.reset();
    this.router.navigateByUrl("/issues");
  }

  /**
   * Method called upon clicking the map
   */
  onLocationSet($event): void {
    console.log($event);
    this.mapClicked = true;
    this.editIssueForm.get('location').setValue(new Point($event));
    this.editIssueForm.get('location').updateValueAndValidity();
    //this.issueNewRequest.location = new Point($event);
  }
}