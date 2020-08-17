import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms'
import { RegistrationRequest } from 'src/app/models/registration-request';
import { debounceTime, map } from 'rxjs/operators';
import { UserService } from 'src/app/api/services/user.service';
import { Router } from '@angular/router';


function confirmPassword(c: AbstractControl): {[key: string]: boolean} | null {
  let passwordControl = c.get('password');
  let passwordRepeatControl = c.get('passwordRepeat');
  // skip the validation
  if(passwordControl.pristine || passwordRepeatControl.pristine){
    return (null)
  }
  if(passwordRepeatControl.value === passwordControl.value) {
    return (null);
  }
  return {'nomatch': true};
}

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit {

  registerForm: FormGroup;
  registration: RegistrationRequest;

  errorMessage: string;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private userService: UserService) {

    this.registration = new RegistrationRequest();
  }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name:       ['', [Validators.required, Validators.maxLength(25), Validators.pattern('[a-zA-Z0-9]*')], /*this.validateNameNotTaken.bind(this)*/],
      passwordGroup: this.formBuilder.group({
        password:       ['', [Validators.required, Validators.minLength(4)]],
        passwordRepeat: ['', [Validators.required]]
      }, {validator: confirmPassword}),
      firstname:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastname:   ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      phone:      ['', [Validators.maxLength(20)]]
      //roles:      [{value: ['citizen'], disabled: true}]
    });

    /* this.registerForm.get('password').valueChanges.subscribe(
      value => this.setNotification(value)
    ); */
  }

  // https://alligator.io/angular/async-validators/
  validateNameNotTaken(control: AbstractControl) {
    return this.userService.checkNameNotTaken(control.value).pipe(
      map(res => res ? null : { nameTaken: true }));
  }

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
      } else {
        this.onRegistrationComplete();
      }
    } else {
      this.errorMessage = 'Please correct the validation errors.';
    }
  }

  onRegistrationComplete(): void {
    // Reset the form to clear the flags
    this.registerForm.reset();
    this.router.navigateByUrl("/issues")
  }
}