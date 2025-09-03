import { Component } from '@angular/core';
import { User } from '../../../models/classes/user.model';
import { UserService } from '../../../services/user/user.service';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { stringify } from 'querystring';
import { AuthService } from '../../../services/auth/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, RouterLink, ReactiveFormsModule, NgFor],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  constructor(private router: Router, public authService: AuthService, private userService: UserService) { }

  userLoginName: string = '';

  userList: User[] = [];

  ngOnInit() {
    this.userList = this.userService.getAllUsers();
  }

  loginForm = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    userPassword: new FormControl('', [Validators.required])
  });

  invalidCredentials: boolean = false;

  name: string | null | undefined = '';
  password: string | null | undefined = '';



  loginUser() {
    this.name = this.loginForm.get('userName')?.value;
    this.password = this.loginForm.get('userPassword')?.value;

    const matchedUser = this.userList.find(user => user.userName === this.name);

    if (matchedUser && matchedUser.password === this.password) {
      this.authService.loginUser(matchedUser);

      if (matchedUser.userRole.includes('admin')) {
        this.router.navigate(['admin-dashboard', matchedUser.id]);
        console.log('admin-dashboard');
      } else if (matchedUser.userRole.includes('user')) {
        console.log('user-dashboard');
        this.router.navigate(['user-dashboard', matchedUser.id]);
      } else {
        this.router.navigate(['/']);
      }
    } else {
      console.log('❌ Invalid credentials');
      this.invalidCredentials = true;
    }
  }

  userLogin(event:Event): void {
    this.userLoginName = this.loginForm.get('userName')?.value || '';
    console.log('User Login Name:', this.userLoginName);
    
    this.userLoginName = event.target as HTMLInputElement ? (event.target as HTMLInputElement).value : '';
    console.log('User Login Name from Event:', this.userLoginName);
    
  }

}