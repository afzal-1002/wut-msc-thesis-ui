import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })

export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable(); // for async pipe

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login() { this.isLoggedInSubject.next(true); }
  loginUser(user: User) { this.currentUserSubject.next(user);}

  logout() {
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }
  
  getStatus(): boolean { return this.isLoggedInSubject.value; }
  getCurrentUserStatus(): User | null { return this.currentUserSubject.value;}


}