import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, FormControl } from '@angular/forms';
import { IssueNewRequest } from 'src/app/models/issue-new-request';
import { Point, Issue } from 'src/app/models/issue';
import { IssueService } from 'src/app/api/services/issue.service';
import { IssueTypeService } from 'src/app/api/services/issue-type.service';
import { IssueType } from 'src/app/models/issue-type';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute } from '@angular/router';

function checkTagLength(c: AbstractControl): {[key: string]: boolean} | null {

  const hasExpectedLength = (tag: string) => 2 <= tag.length && tag.length <= 25;

  if(c.value.every(hasExpectedLength)){
    return (null);
  }
  return {'tagLength': true};
}

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
  issueNewRequest: IssueNewRequest;
  issueTypes: IssueType[];

  errorMessage: string;
  mapClicked: boolean;

  tags: string[];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private issueTypeService: IssueTypeService,
              private issueService: IssueService) {
    this.tags = [];
    this.issueNewRequest = new IssueNewRequest();
    this.mapClicked = false;
  }

  ngOnInit(): void {
    this.getAllIssueTypes();
    this.editIssueForm = this.formBuilder.group({
      description:  ['', [Validators.required, Validators.maxLength(1000)]],
      issueType:    ['', [Validators.required]],
      //imageUrl:     ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      imageUrls:    this.formBuilder.array([this.buildImageUrl()]),
      tags:         [this.tags, [Validators.required, checkTagLength]],
      location:     ['', [Validators.required]]
      //roles:      [{value: ['citizen'], disabled: true}]
    });

    //this.editIssueForm.controls['tags'].setValue(this.tags);

    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.getIssue(this.id);
    }

/*     this.editIssueForm.get('issueType').valueChanges.subscribe(item => {
      this.issueTypes = item.issueTypes
    }); */
  }

  getIssue(id: string): void {
    this.issueService.loadIssue(id)
        .subscribe({
            next: (issue: Issue) => {
              this.issue = issue;
              this.issuePoint.push(new Point(this.issue.location.coordinates));
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
            //error: err => this.errorMessage = err
        });
  }

  buildImageUrl(): FormControl {
    //return this.formBuilder.control({
    //  imageUrl:     ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]]
  //});
  return new FormControl(
    '', [Validators.required, Validators.maxLength(500), Validators.pattern('^https?://(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:/[^/#?]+)+\.(?:jpg|gif|png)$')]);
  }

  get imageUrl(): FormControl {
    if(this.editIssueForm) {
      return <FormControl>this.editIssueForm.get('imageUrl');
    }
    return null;
  }

  get imageUrls(): FormArray {
    if(this.editIssueForm) {
      return <FormArray>this.editIssueForm.get('imageUrls');
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

/*   setNotification(notifyVia: string): void {
    //TODO
  } */

  //registerForm.get('firstname').valid
  //registerForm.get('passwordGroup.password').valid

  /* get tags() {
    if(this.editIssueForm) {
      return <FormControl>this.editIssueForm.get('tags');
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

  removeTag(tag: string): void {
    //let controller = this.editIssueForm.controls['tags'];
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
      this.editIssueForm.controls['tags'].updateValueAndValidity();
      this.editIssueForm.controls['tags'].markAsDirty();
    }
  }

  removeImageUrl(index: number): void {
    this.imageUrls.removeAt(index);
  }

  reportIssue(): void {
    if (this.editIssueForm.valid) {
      if (this.editIssueForm.dirty) {

        this.issueNewRequest.issueTypeHref = this.editIssueForm.get('issueType').value;
        this.issueNewRequest.description = this.editIssueForm.get('description').value;
        this.issueNewRequest.imageUrl = this.editIssueForm.get('imageUrls').value[0] ;
        this.issueNewRequest.additionalImageUrls = this.editIssueForm.get('imageUrls').value.slice(1) ;
        this.editIssueForm.controls['tags'].markAsTouched();
        this.issueNewRequest.tags = this.editIssueForm.controls['tags'].value ;
        this.issueNewRequest.location = this.editIssueForm.get('location').value;

        console.log(this.issueNewRequest);

        this.issueService.updateIssue(this.id, this.issueNewRequest)
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
    this.editIssueForm.reset();
    //this.router.navigate(['/issues']);
  }

  onLocationSet($event): void {
    console.log($event);
    this.mapClicked = true;
    this.editIssueForm.get('location').setValue(new Point($event));
    //this.issueNewRequest.location = new Point($event);
  }
}