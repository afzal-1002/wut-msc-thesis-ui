import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../../models/classes/user.model';
import { UserService } from '../../../services/user/user.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NgIf, RouterLink, ReactiveFormsModule, NgClass],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent {
  constructor(private router: Router, private userService: UserService) { }

  newUser: User | null = null;

  signUpForm = new FormGroup({
    userName: new FormControl('', [Validators.required, Validators.minLength(5)]),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    userEmail: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    ]),
    phoneNumber: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\+?\d{10,15}$/)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(25)
    ]),
    userRole: new FormControl('', Validators.required)
  });


  registerUser() {
  if (this.signUpForm.invalid) {
    this.signUpForm.markAllAsTouched();
    console.log('Form Valid:', this.signUpForm.valid);
    console.log('Form Data:', this.signUpForm.value);
    return;
  }

  const formData = this.signUpForm.value;

  const user = new User(
    this.userService.getAllUsers().length + 1,
    formData.userName!,
    formData.firstName!,
    formData.lastName!,
    formData.userEmail!,
    formData.phoneNumber!,
    formData.password!,
    formData.userRole ? [formData.userRole] : [],
    false
  );

  this.userService.users.push(user);
  this.newUser = user;

  console.log('✅ User created:', user);
  this.signUpForm.reset(); 

  this.router.navigate(['/registerProfile', user.id]);
}




  getValidationClass(controlName: string) {
    const control = this.signUpForm.get(controlName);
    if (!control) return '';
    if (control.invalid && (control.touched || control.dirty)) return 'is-invalid';
    if (control.valid && (control.touched || control.dirty)) return 'is-valid';
    return '';
  }

  get userEmail() {
    return this.signUpForm.get('userEmail');
  }

  get phoneNumber() {
    return this.signUpForm.get('phoneNumber');
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get firstName() {
    return this.signUpForm.get('firstName');
  }

  get lastName() {
    return this.signUpForm.get('lastName');
  }

  get userName() {
    return this.signUpForm.get('userName');
  }

  get userRole() {
    return this.signUpForm.get('userRole');
  }
}
