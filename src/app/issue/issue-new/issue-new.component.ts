import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, FormControl } from '@angular/forms';
import { IssueNewRequest } from 'src/app/models/issue-new-request';
import { Point } from 'src/app/models/issue';
import { IssueService } from 'src/app/api/services/issue.service';
import { IssueTypeService } from 'src/app/api/services/issue-type.service';
import { IssueType } from 'src/app/models/issue-type';

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
  descriptionMessage: string[];
  imageUrlMessage: string[];
  tagsMessage: string[];

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
      additionalImageUrls:  this.formBuilder.array([this.buildImageUrl()]),
      tags:         ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]]
      //roles:      [{value: ['citizen'], disabled: true}]
    });
  }

  buildImageUrl(): FormControl {
    return this.formBuilder.control({
      imageUrl:     ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]]
    });
  }

  get imageUrl(): FormControl {
    return <FormControl>this.newIssueForm.get('imageUrl');
  }

  get additionalImageUrls(): FormArray {
    return <FormArray>this.newIssueForm.get('additionalImageUrls');
  }

  addImageUrl(): void {
    this.additionalImageUrls.push(this.buildImageUrl());
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

  private issueTypeHrefValidationMessages = {
    required: 'Please select a type for the issue.'
  };

  private imageUrlValidationMessages = {
    required: 'Please enter an image URL.',
    pattern: 'The image URL is not valid.'
  };

  private tagValidationMessages = {
    //required: 'Please enter a firstname.',
    minlength: 'Each tag must contain at least 2 characters.',
    maxlength: 'Each tag must contain at most 25 characters.'
  };

/*   const descriptionControl = this.newIssueForm.get('description');
  descriptionControl.valueChanges.pipe(
    debounceTime(1000)
  ).subscribe(
    value => this.setDescriptionMessage(descriptionControl)
  );

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

  setDescriptionMessage(c: AbstractControl): void {
    this.descriptionMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      console.log(c.errors);
      this.descriptionMessage = Object.keys(c.errors).map(
        key => this.descriptionValidationMessages[key]).join(' ');
    }
  } */

/*   setNotification(notifyVia: string): void {
    //TODO
  } */

  //registerForm.get('firstname').valid
  //registerForm.get('passwordGroup.password').valid

  onMapClicked(){
    this.issueNewRequest.location = new Point([0, 0]);
  }

  reportIssue(): void {
    if (this.newIssueForm.valid) {
      if (this.newIssueForm.dirty) {

        this.issueNewRequest.issueTypeHref = null ;
        //this.issueNewRequest.location = new Point([0, 0]);
        this.issueNewRequest.description = this.newIssueForm.get('description').value;
        this.issueNewRequest.imageUrl = this.newIssueForm.get('additionalImageUrls').value[0] ;
        this.issueNewRequest.additionalImageUrls = this.newIssueForm.get('additionalImageUrls').value.slice(1) ;
        this.issueNewRequest.tags = null ;

        //this.issueNewRequest.state = "new";
        //this.issueNewRequest.createdAt = null ;
        //this.issueNewRequest.creatorHref = me.href;
        //this.issueNewRequest.imageUrl = this.newIssueForm.get(this.additionalImageUrls.get('0.imageUrl'))?.value;

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

  onLocationSet(location: [number, number]): void {
    this.issueNewRequest.location = new Point(location);
  }
}