import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, FormControl } from '@angular/forms';
import { IssueNewRequest } from 'src/app/models/issue-new-request';
import { Point } from 'src/app/models/issue';
import { IssueService } from 'src/app/api/services/issue.service';
import { IssueTypeService } from 'src/app/api/services/issue-type.service';
import { IssueType } from 'src/app/models/issue-type';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { Router } from '@angular/router';
import { MessagingService } from 'src/app/shared/services/messaging.service';

/**
 * Custom form validator which checks for every tags in the value array to have acceptable lengths
 */
function checkTagLength(c: AbstractControl): {[key: string]: boolean} | null
{
  const hasExpectedLength = (tag: string) => 2 <= tag.length && tag.length <= 25;

  // every tags have acceptable lengths
  if(c.value != null && c.value.every(hasExpectedLength))
  {
    return (null);
  }
  // at least one tag does not have an acceptable length
  return {'tagLength': true};
}

/**
 * New issue creation page
 */
@Component({
  selector: 'app-issue-new',
  templateUrl: './issue-new.component.html',
  styleUrls: ['./issue-new.component.scss']
})
export class IssueNewComponent implements OnInit
{
  newIssueForm: FormGroup;
  issueNewRequest: IssueNewRequest; // the issue request object aimed at being sent to the API

  mapClicked: boolean;

  issueTypes: IssueType[];
  tags: string[];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]; // keys that delimit the different tags in the mat-chip element

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private issueTypeService: IssueTypeService,
              private issueService: IssueService,
              private messagingService: MessagingService)
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

    // We initialize the issue creation form
    this.newIssueForm = this.formBuilder.group({
      description:  ['', [Validators.required, Validators.maxLength(1000)]],
      issueType:    ['', [Validators.required]],
      imageUrls:    this.formBuilder.array([this.buildImageUrl()]), // stores the multiple image URLs
      tags:         [this.tags, [Validators.required, checkTagLength]],
      location:     ['', [Validators.required]]
    });

    this.newIssueForm.controls['tags'].setValue(this.tags);
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
    if(this.newIssueForm) {
      return <FormArray>this.newIssueForm.get('imageUrls');
    }
    return null;
  }

  /**
   * Method called upon clicking the "Add image" button
   */
  addImageUrl(): void
  {
    this.imageUrls.push(this.buildImageUrl());
  }

  /**
   * Method which gets the list of all existing issue types and assigns it to the dedicated instance variable
   */
  getAllIssueTypes(): void
  {
    this.issueTypeService.loadAllIssueTypes()
        .subscribe({
            next: (issueTypes: IssueType[]) => this.issueTypes = issueTypes,
            error: () => this.messagingService.open('Could not populate issue types list!')
        });
  }

  /**
   * Method called upon pressing one of the defined separator keys in the mat-chip element
   */
  addTag(event: MatChipInputEvent)
  {
    const input = event.input;
    const value = event.value;
    if ((value.trim() !== '')) {
      this.newIssueForm.controls['tags'].setErrors(null);   // 1
      const tempEmails = this.newIssueForm.controls['tags'].value; // 2
      tempEmails.push(value.trim());
      this.newIssueForm.controls['tags'].setValue(tempEmails);     // 3
      if (this.newIssueForm.controls['tags'].valid) {              // 4
        this.newIssueForm.controls['tags'].markAsDirty();
        input.value = '';                                    // 5
      } else {
        const index = this.newIssueForm.controls['tags'].value.findIndex(value1 => value1 === value.trim());
        if (index !== -1) {
          this.newIssueForm.controls['tags'].value.splice(index, 1);           // 6
        }
      }
    } else {
      this.newIssueForm.controls['tags'].updateValueAndValidity();  // 7
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
  removeTag(tag: string): void
  {
    //let controller = this.newIssueForm.controls['tags'];
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
      this.newIssueForm.controls['tags'].updateValueAndValidity();
      this.newIssueForm.controls['tags'].markAsDirty();
    }
  }

  /**
   * Method called upon clicking the delete button associated with an image URL input field
   */
  removeImageUrl(index: number): void
  {
    this.imageUrls.removeAt(index);
  }

  /**
   * Method called upon clicking the form submit button
   */
  reportIssue(): void
  {
    if (this.newIssueForm.valid) {
      if (this.newIssueForm.dirty) {

        // We build the issue request object to be sent to the API
        this.issueNewRequest.issueTypeHref = this.newIssueForm.get('issueType').value;
        this.issueNewRequest.description = this.newIssueForm.get('description').value;
        this.issueNewRequest.imageUrl = this.newIssueForm.get('imageUrls').value[0] ;
        this.issueNewRequest.additionalImageUrls = this.newIssueForm.get('imageUrls').value.slice(1) ;
        this.newIssueForm.controls['tags'].markAsTouched();
        this.issueNewRequest.tags = this.newIssueForm.controls['tags'].value ;
        this.issueNewRequest.location = this.newIssueForm.get('location').value;

        console.log(this.issueNewRequest);

        // We send the issue request object to the back-end
        this.issueService.createIssue(this.issueNewRequest)
          .subscribe({
            next: () => this.onCreationComplete(),
            error: err => this.messagingService.open('Could not report issue!')
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
    this.messagingService.open('Your issue was reported successfully.');
    // Reset the form to clear the flags
    this.newIssueForm.reset();
    this.router.navigateByUrl("/issues");
  }

  /**
   * Method called upon clicking the map
   */
  onLocationSet($event): void
  {
    console.log($event);
    this.mapClicked = true;
    this.newIssueForm.get('location').setValue(new Point($event));
    //this.issueNewRequest.location = new Point($event);
  }

/*
  const issueTypeHrefControl = this.newIssueForm.get('issueType');
  issueTypeHrefControl.valueChanges.pipe(
    debounceTime(1000)
  ).subscribe(
    value => this.setIssueTypeHrefMessage(issueTypeHrefControl)
  );
  const imageControl = this.newIssueForm.get('images.0');
  imageControl.valueChanges.pipe(
    debounceTime(1000)
  ).subscribe(
    value => this.setImageUrlMessage(imageControl)
  );
   */
}