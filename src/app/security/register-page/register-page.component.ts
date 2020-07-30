import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms'
import { RegistrationRequest } from 'src/app/models/registration-request';
import { debounceTime, map } from 'rxjs/operators';
import { UserService } from 'src/app/api/services/user.service';


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
  nameMessage: string;
  passwordMessage: string;
  passwordGroupMessage: string;
  firstnameMessage: string;
  lastnameMessage: string;
  phoneMessage: string;

  private nameValidationMessages = {
    required: 'Please enter a username.',
    maxlength: 'The username must contain at most 25 characters.',
    pattern: 'The username must only contain alphanumerical characters',
    nameTaken: 'This username is not available, please choose another one.'
  };

  private passwordValidationMessages = {
    required: 'Please enter a password.',
    minlength: 'The password must contain at least 4 characters.'
  };

  private passwordGroupValidationMessages = {
    nomatch: 'The password confirmation and password do not match.'
  };

  private firstnameValidationMessages = {
    required: 'Please enter a firstname.',
    minlength: 'The firstname must contain at least 2 characters.',
    maxlength: 'The firstname must contain at most 25 characters.'
  };

  private lastnameValidationMessages = {
    required: 'Please enter a lastname.',
    minlength: 'The lastname must contain at least 2 characters.',
    maxlength: 'The lastname must contain at most 25 characters.'
  };

  private phoneValidationMessages = {
    maxlength: 'The phone number must contain at most 20 characters.'
  };

  constructor(private formBuilder: FormBuilder,
              private userService: UserService) {

    this.registration = new RegistrationRequest();
  }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name:       ['', [Validators.required, Validators.maxLength(25), Validators.pattern('[a-zA-Z0-9]*')], this.validateNameNotTaken.bind(this)],
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

    const nameControl = this.registerForm.get('name');
    nameControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setNameMessage(nameControl)
    );

    const passwordGroupControl = this.registerForm.get('passwordGroup');
    passwordGroupControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setPasswordGroupMessage(passwordGroupControl)
    );

    const passwordControl = this.registerForm.get('passwordGroup.password');
    passwordControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setPasswordMessage(passwordControl)
    );

    const firstnameControl = this.registerForm.get('firstname');
    firstnameControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setFirstnameMessage(firstnameControl)
    );

    const lastnameControl = this.registerForm.get('lastname');
    lastnameControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setLastnameMessage(lastnameControl)
    );

    const phoneControl = this.registerForm.get('phone');
    phoneControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setPhoneMessage(phoneControl)
    );
  }

  // https://alligator.io/angular/async-validators/
  validateNameNotTaken(control: AbstractControl) {
    return this.userService.checkNameNotTaken(control.value).pipe(
      map(res => res ? null : { nameTaken: true }));
  }

  setPasswordGroupMessage(c: AbstractControl): void {
    this.passwordGroupMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      console.log(c.errors);
      this.passwordGroupMessage = Object.keys(c.errors).map(
        key => this.passwordGroupValidationMessages[key]).join(' ');
    }
  }

  setPasswordMessage(c: AbstractControl): void {
    this.passwordMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      console.log(c.errors);
      this.passwordMessage = Object.keys(c.errors).map(
        key => this.passwordValidationMessages[key]).join(' ');
    }
  }

  setNameMessage(c: AbstractControl): void {
    this.nameMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      console.log(c.errors);
      this.nameMessage = Object.keys(c.errors).map(
        key => this.nameValidationMessages[key]).join(' ');
    }
  }

  setFirstnameMessage(c: AbstractControl): void {
    this.firstnameMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      console.log(c.errors);
      this.firstnameMessage = Object.keys(c.errors).map(
        key => this.firstnameValidationMessages[key]).join(' ');
    }
  }

  setLastnameMessage(c: AbstractControl): void {
    this.lastnameMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      console.log(c.errors);
      this.lastnameMessage = Object.keys(c.errors).map(
        key => this.lastnameValidationMessages[key]).join(' ');
    }
  }

  setPhoneMessage(c: AbstractControl): void {
    this.phoneMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      this.phoneMessage = Object.keys(c.errors).map(
        key => this.phoneValidationMessages[key]).join(' ');
    }
  }

/*   setNotification(notifyVia: string): void {
    //TODO
  } */

  //registerForm.get('firstname').valid
  //registerForm.get('passwordGroup.password').valid

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
    //this.router.navigate(['/issues']);
  }
}