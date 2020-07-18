import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, FormControl } from '@angular/forms';
import { IssueNewRequest } from 'src/app/models/issue-new-request';
import { Point } from 'src/app/models/issue';
import { IssueService } from 'src/app/api/services/issue.service';
import { IssueTypeService } from 'src/app/api/services/issue-type.service';
import { IssueType } from 'src/app/models/issue-type';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-issue-new',
  templateUrl: './issue-new.component.html',
  styleUrls: ['./issue-new.component.scss']
})
export class IssueNewComponent implements OnInit {

  newIssueForm: FormGroup;
  issueNewRequest: IssueNewRequest;
  issueTypes: IssueType[];

  errorMessage: string;
  descriptionMessage: string;
  imageUrlMessage: string;
  issueTypeMessage: string;
  tagsMessage: string;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private formBuilder: FormBuilder,
              private issueTypeService: IssueTypeService,
              private issueService: IssueService) {
    this.issueNewRequest = new IssueNewRequest();
  }

  ngOnInit(): void {
    this.getAllIssueTypes();
    this.newIssueForm = this.formBuilder.group({
      description:  ['', [Validators.required, Validators.maxLength(1000)]],
      issueType:    ['', [Validators.required]],
      //imageUrl:     ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      imageUrls:  this.formBuilder.array([this.buildImageUrl()]),
      tags:         ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]]
      //roles:      [{value: ['citizen'], disabled: true}]
    });

/*     this.newIssueForm.get('issueType').valueChanges.subscribe(item => {
      this.issueTypes = item.issueTypes
    }); */

    const descriptionControl = this.newIssueForm.get('description');
    descriptionControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setDescriptionMessage(descriptionControl)
    );

    const issueTypeControl = this.newIssueForm.get('issueType');
    issueTypeControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setIssueTypeMessage(issueTypeControl)
    );

    const imageUrlsControl = this.newIssueForm.get('imageUrls');
    imageUrlsControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setImageUrlsMessage(imageUrlsControl)
    );

    const tagsControl = this.newIssueForm.get('tags');
    tagsControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setTagsMessage(tagsControl)
    );
  }

  buildImageUrl(): FormControl {
    return this.formBuilder.control({
      imageUrl:     ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]]
    });
  }

  get imageUrl(): FormControl {
    return <FormControl>this.newIssueForm.get('imageUrl');
  }

  get imageUrls(): FormArray {
    return <FormArray>this.newIssueForm.get('imageUrls');
  }

  addImageUrl(): void {
    this.imageUrls.push(this.buildImageUrl());
  }

  getAllIssueTypes(): void {
    this.issueTypeService.loadAllIssueTypes()
        .subscribe({
            next: (issueTypes: IssueType[]) => this.issueTypes = issueTypes,
            //error: err => this.errorMessage = err
        });
  }

  private descriptionValidationMessages = {
    required: 'Please enter a description.',
    maxlength: 'The description must contain at most 1000 characters.'
  };

  private issueTypeValidationMessages = {
    required: 'Please select a type for the issue.'
  };

  private imageUrlValidationMessages = {
    required: 'Please enter an image URL.',
    pattern: 'The image URL is not valid.'
  };

  private tagsValidationMessages = {
    required: 'Please enter at least one tag.',
    minlength: 'Each tag must contain at least 2 characters.',
    maxlength: 'Each tag must contain at most 25 characters.'
  };

/*   setNotification(notifyVia: string): void {
    //TODO
  } */

  //registerForm.get('firstname').valid
  //registerForm.get('passwordGroup.password').valid

  get tags() {
    return this.newIssueForm.get('tags');
  }

  addTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our tag
    if ((value || '').trim()) {
      this.tags.setValue([...this.tags.value, value.trim()]);
      this.tags.updateValueAndValidity();
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeTag(tag: string): void {
    const index = this.tags.value.indexOf(tag);

    if (index >= 0) {
      this.tags.value.splice(index, 1);
      this.tags.updateValueAndValidity();
    }
  }

  reportIssue(): void {
    if (this.newIssueForm.valid) {
      if (this.newIssueForm.dirty) {

        this.issueNewRequest.issueTypeHref = this.newIssueForm.get('issueType').value;
        //this.issueNewRequest.location = new Point([0, 0]);
        this.issueNewRequest.description = this.newIssueForm.get('description').value;
        this.issueNewRequest.imageUrl = this.newIssueForm.get('imageUrls').value[0] ;
        this.issueNewRequest.additionalImageUrls = this.newIssueForm.get('imageUrls').value.slice(1) ;
        this.issueNewRequest.tags = this.tags.value ;

        //this.issueNewRequest.state = "new";
        //this.issueNewRequest.createdAt = null ;
        //this.issueNewRequest.creatorHref = me.href;
        //this.issueNewRequest.imageUrl = this.newIssueForm.get(this.additionalImageUrls.get('0.imageUrl'))?.value;

        console.log(this.issueNewRequest);

        this.issueService.createIssue(this.issueNewRequest)
          .subscribe({
            next: () => this.onCreationComplete(),
            error: err => this.errorMessage = err
          });
      } else {
        this.onCreationComplete();
      }
    } else {
      this.errorMessage = 'Please correct the validation errors.';
    }
  }

  onCreationComplete(): void {
    // Reset the form to clear the flags
    this.newIssueForm.reset();
    //this.router.navigate(['/issues']);
  }

  onLocationSet($event): void {
    console.log($event);
    this.issueNewRequest.location = new Point($event);
  }

  setDescriptionMessage(c: AbstractControl): void {
    this.descriptionMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      console.log(c.errors);
      this.descriptionMessage = Object.keys(c.errors).map(
        key => this.descriptionValidationMessages[key]).join(' ');
    }
  }

  setIssueTypeMessage(c: AbstractControl): void {
    this.issueTypeMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      console.log(c.errors);
      this.issueTypeMessage = Object.keys(c.errors).map(
        key => this.issueTypeValidationMessages[key]).join(' ');
    }
  }

  setImageUrlsMessage(c: AbstractControl): void {
    this.imageUrlMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      console.log(c.errors);
      this.imageUrlMessage = Object.keys(c.errors).map(
        key => this.imageUrlValidationMessages[key]).join(' ');
    }
  }

  setTagsMessage(c: AbstractControl): void {
    this.tagsMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      console.log(c.errors);
      this.tagsMessage = Object.keys(c.errors).map(
        key => this.tagsValidationMessages[key]).join(' ');
    }
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