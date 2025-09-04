import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { User } from '../../../models/classes/user.model';
import { UserService } from '../../../services/user/user.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, RouterLink, ReactiveFormsModule, NgFor],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private router: Router,
    public authService: AuthService,
    private userService: UserService
  ) {}

  userList: User[] = [];
  invalidCredentials = false;

  // Strongly typed form controls (non-nullable)
  loginForm = new FormGroup({
    userName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    userPassword: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    this.userList = this.userService.getAllUsers();
  }

  private hasRole(user: User, role: string): boolean {
    const roles = Array.isArray(user.userRole) ? user.userRole : [user.userRole];
    return roles.includes(role);
  }

  loginUser(): void {
    this.invalidCredentials = false;

    const { userName, userPassword } = this.loginForm.getRawValue();
    const matchedUser = this.userList.find(u => u.userName === userName);

    if (matchedUser && matchedUser.password === userPassword) {
      // Let AuthService persist normalized user in sessionStorage
      this.authService.loginUser(matchedUser);

      if (this.hasRole(matchedUser, 'admin')) {
        this.router.navigate(['admin-dashboard', matchedUser.id]);
      } else if (this.hasRole(matchedUser, 'user')) {
        this.router.navigate(['user-dashboard', matchedUser.id]);
      } else {
        this.router.navigate(['/']);
      }
    } else {
      this.invalidCredentials = true;
    }
  }
}
