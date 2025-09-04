// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { User } from '../../models/classes/user.model';
import { UserSessionService } from '../user-session/user-session.service';

const LOGIN_USER = 'currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$ = new BehaviorSubject<User | null>(null);

  // public streams with types
  currentUser$ = this.user$.asObservable();
  isLoggedIn$: Observable<boolean> = this.currentUser$.pipe(map(u => !!u));
  isUser$:     Observable<boolean> = this.currentUser$.pipe(map(u => this.hasRole(u, 'user')));
  isAdmin$:    Observable<boolean> = this.currentUser$.pipe(map(u => this.hasRole(u, 'admin')));

  constructor(private sessionService: UserSessionService) { 
    const saved = this.normalizeUser(this.sessionService.getItem<any>(LOGIN_USER));
    this.user$.next(saved);
  }

  loginUser(user: User): void {
    const clean = this.normalizeUser(user)!;
    this.user$.next(clean);
    this.sessionService.setItem(LOGIN_USER, clean);
  }

  logout(): void {
    this.user$.next(null);
    this.sessionService.removeItem(LOGIN_USER);
  }

  get currentUser(): User | null {
    const u = this.normalizeUser(this.sessionService.getItem<any>(LOGIN_USER));
    if (u !== this.user$.value) this.user$.next(u);
    return u;
  }

  private hasRole(u: User | null, role: string): boolean {
    if (!u || !u.userRole) return false;
    const roles = Array.isArray(u.userRole) ? u.userRole : [u.userRole];
    return roles.includes(role);
  }

  private normalizeUser(user: any): User | null {
    if (!user) return null;
    return {
      id:       user.id        ?? user._id        ?? user.userId ?? null,
      userName: user.userName  ?? user._userName  ?? user.name   ?? '',
      userRole: user.userRole  ?? user._userRole  ?? user.role   ?? [],
    } as User;
  }
}
