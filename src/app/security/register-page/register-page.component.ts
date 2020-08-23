import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms'
import { RegistrationRequest } from 'src/app/models/registration-request';
import { debounceTime, map } from 'rxjs/operators';
import { UserService } from 'src/app/api/services/user.service';
import { Router } from '@angular/router';

/**
 * Custom form validator which checks for the value of the password repeat field to match the value of the original password field
 */
function confirmPassword(c: AbstractControl): {[key: string]: boolean} | null {
  let passwordControl = c.get('password');
  let passwordRepeatControl = c.get('passwordRepeat');

  // skip the validation in case any of the two input fields have not been touched yet
  if(passwordControl.pristine || passwordRepeatControl.pristine){
    return (null)
  }
  // the fields match
  if(passwordRepeatControl.value === passwordControl.value) {
    return (null);
  }
  // the fields do not match
  return {'nomatch': true};
}

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit {

  registerForm: FormGroup;
  registration: RegistrationRequest;  // the registration object aimed at being sent to the API

  errorMessage: string;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private userService: UserService)
  {
    // We initialize the registration object aimed at being sent to the API
    this.registration = new RegistrationRequest();
  }

  ngOnInit(): void {
    /**
     * We initialize the registration form
     */
    this.registerForm = this.formBuilder.group({
      name:       ['', [Validators.required, Validators.maxLength(25), Validators.pattern('[a-zA-Z0-9]*')], /*this.validateNameNotTaken.bind(this)*/],
      passwordGroup: this.formBuilder.group({
        password:       ['', [Validators.required, Validators.minLength(4)]],
        passwordRepeat: ['', [Validators.required]]
      }, {validator: confirmPassword}),
      firstname:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastname:   ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      phone:      ['', [Validators.maxLength(20)]]
      //roles:      [{value: ['citizen'], disabled: true}]  // Alternative to hard-coding "roles = ['citizen']" in User constructor
    });
  }

  /**
   * Custom form validator which checks for the provided username not to already exist in back-end
   * Commented-out in form because checkNameNotTaken() requires API token to be already granted, which does not fit with a registration use-case
   */
  validateNameNotTaken(control: AbstractControl) {
    return this.userService.checkNameNotTaken(control.value).pipe(
      map(res => res ? null : { nameTaken: true }));
  }

  /**
   * Method called upon clicking the form submit button
   */
  registerUser(): void {
    if (this.registerForm.valid) {
      if (this.registerForm.dirty) {
        //const reg = { ...this.registration, ...this.registerForm.value };

        this.registration.name = this.registerForm.get('name').value.toLowerCase();
        this.registration.password = this.registerForm.get('passwordGroup.password').value;
        this.registration.firstname = this.registerForm.get('firstname').value;
        this.registration.lastname = this.registerForm.get('lastname').value;
        this.registration.phone = this.registerForm.get('phone').value;
        //this.registration.roles = ['citizen'];

        this.userService.createUser(this.registration)
          .subscribe({
            next: () => this.onRegistrationComplete(),
            error: err => this.errorMessage = err
          });
      } else {  // if ever the user manages to submit the form although it is pristine, we skip the call to the API
        this.onRegistrationComplete();
      }
    } else {    // the form is invalid
      this.errorMessage = 'Please correct the validation errors.';
    }
  }

  onRegistrationComplete(): void {
    this.registerForm.reset();            // Reset the form to clear the flags
    this.router.navigateByUrl("/issues")
  }
}