import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, FormControl } from '@angular/forms';
import { IssueNewRequest } from 'src/app/models/issue-new-request';
import { Point } from 'src/app/models/issue';
import { IssueService } from 'src/app/api/services/issue.service';
import { IssueTypeService } from 'src/app/api/services/issue-type.service';
import { IssueType } from 'src/app/models/issue-type';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { debounceTime } from 'rxjs/operators';

function checkTagLength(c: AbstractControl): {[key: string]: boolean} | null {

  const hasExpectedLength = (tag: string) => 2 <= tag.length && tag.length <= 25;

  if(c.value.every(hasExpectedLength)){
    return (null);
  }
  return {'tagLength': true};
}

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
  locationMessage: string;

  tags: string[];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private formBuilder: FormBuilder,
              private issueTypeService: IssueTypeService,
              private issueService: IssueService) {
    this.tags = [];
    this.issueNewRequest = new IssueNewRequest();
  }

  ngOnInit(): void {
    this.getAllIssueTypes();
    this.newIssueForm = this.formBuilder.group({
      description:  ['', [Validators.required, Validators.maxLength(1000)]],
      issueType:    ['', [Validators.required]],
      //imageUrl:     ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      imageUrls:    this.formBuilder.array([this.buildImageUrl()]),
      tags:         [this.tags, [Validators.required, checkTagLength]],
      location:     ['', [Validators.required]]
      //roles:      [{value: ['citizen'], disabled: true}]
    });

    this.newIssueForm.controls['tags'].setValue(this.tags);

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
    /* imageUrlsControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setImageUrlsMessage(imageUrlsControl)
    ); */

    const tagsControl = this.newIssueForm.get('tags');
    tagsControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setTagsMessage(tagsControl)
    );

    const locationControl = this.newIssueForm.get('location');
    locationControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setLocationMessage(locationControl)
    );
  }

  buildImageUrl(): FormControl {
    //return this.formBuilder.control({
    //  imageUrl:     ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]]
  //});
  return new FormControl(
    '', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]);
  }

  get imageUrl(): FormControl {
    if(this.newIssueForm) {
      return <FormControl>this.newIssueForm.get('imageUrl');
    }
    return null;
  }

  get imageUrls(): FormArray {
    if(this.newIssueForm) {
      return <FormArray>this.newIssueForm.get('imageUrls');
    }
    return null;
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
    tagLength: 'Each tag must contain from 2 to 25 characters.'
  };

  private locationValidationMessages = {
    required: 'Please click the map to set a location for the issue.'
  };

/*   setNotification(notifyVia: string): void {
    //TODO
  } */

  //registerForm.get('firstname').valid
  //registerForm.get('passwordGroup.password').valid

  /* get tags() {
    if(this.newIssueForm) {
      return <FormControl>this.newIssueForm.get('tags');
    }
    return null;
  } */

  /* addTag(event: MatChipInputEvent): void {
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
  } */

  addTag(event: MatChipInputEvent) {
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

  removeTag(tag: string): void {
    //let controller = this.newIssueForm.controls['tags'];
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
      this.newIssueForm.controls['tags'].updateValueAndValidity();
      this.newIssueForm.controls['tags'].markAsDirty();
    }
  }

  reportIssue(): void {
    if (this.newIssueForm.valid) {
      if (this.newIssueForm.dirty) {

        this.issueNewRequest.issueTypeHref = this.newIssueForm.get('issueType').value;
        this.issueNewRequest.description = this.newIssueForm.get('description').value;
        this.issueNewRequest.imageUrl = this.newIssueForm.get('imageUrls').value[0] ;
        this.issueNewRequest.additionalImageUrls = this.newIssueForm.get('imageUrls').value.slice(1) ;
        this.newIssueForm.controls['tags'].markAsTouched();
        this.issueNewRequest.tags = this.newIssueForm.controls['tags'].value ;
        this.issueNewRequest.location = this.newIssueForm.get('location').value;

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
    this.newIssueForm.get('location').setValue(new Point($event));
    //this.issueNewRequest.location = new Point($event);
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

/*   setImageUrlsMessage(c: AbstractControl): void {
    this.imageUrlMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      console.log(c.errors);
      this.imageUrlMessage = Object.keys(c.errors).map(
        key => this.imageUrlValidationMessages[key]).join(' ');
    }
  } */

  setTagsMessage(c: AbstractControl): void {
    this.tagsMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      console.log(c.errors);
      this.tagsMessage = Object.keys(c.errors).map(
        key => this.tagsValidationMessages[key]).join(' ');
    }
  }

  setLocationMessage(c: AbstractControl): void {
    this.locationMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      console.log(c.errors);
      this.locationMessage = Object.keys(c.errors).map(
        key => this.locationValidationMessages[key]).join(' ');
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