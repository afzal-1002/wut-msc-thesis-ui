// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../../models/classes/user.model';
import { SessionStorageService } from '../session/session-storage.service';


// auth.service.ts (snippets)

const LOGIN_USER = 'currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$: BehaviorSubject<User | null>;
  currentUser$ = new BehaviorSubject<User | null>(null).asObservable(); // will reassign below
  isLoggedIn$;
  isUser$;
  isAdmin$;

  constructor(private sessionService: SessionStorageService) {
    const user = this.sessionService.getItem<any>(LOGIN_USER);
    const savedUser = this.normalizeUser(user);        // <-- normalize on read
    this.user$ = new BehaviorSubject<User | null>(savedUser);

    // expose streams
    this.currentUser$ = this.user$.asObservable();
    this.isLoggedIn$  = this.currentUser$.pipe(map(u => !!u));
    this.isUser$      = this.currentUser$.pipe(map(u => this.hasRole(u, 'user')));
    this.isAdmin$     = this.currentUser$.pipe(map(u => this.hasRole(u, 'admin')));
  }

  loginUser(user: User): void {
    const clean = this.normalizeUser(user)!;           // <-- normalize before save
    this.user$.next(clean);
    this.sessionService.setItem(LOGIN_USER, clean);      // store plain DTO (no underscores)
  }

  logout(): void {
    this.user$.next(null);
    this.sessionService.removeItem(LOGIN_USER);
  }

  get currentUser(): User | null {
    const user = this.sessionService.getItem<any>(LOGIN_USER);
    const u = this.normalizeUser(user);
    if (u !== this.user$.value) this.user$.next(u);
    return u;
  }

  // --- helpers ---
  private hasRole(u: User | null, role: string): boolean {
    if (!u || !u.userRole) return false;
    const roles = Array.isArray(u.userRole) ? u.userRole : [u.userRole];
    return roles.includes(role);
  }

  /** Accepts class instances or plain objects; returns a plain User without underscores */
  private normalizeUser(user: any): User | null {
    if (!user) return null;
    return {
      id:       user.id        ?? user._id        ?? user.userId ?? null,
      userName: user.userName  ?? user._userName  ?? user.name   ?? '',
      userRole: user.userRole  ?? user._userRole  ?? user.role   ?? [],
      // add any other fields you need the same way:
      // email: user.email ?? user._email ?? ''
    } as User;
  }
}
