import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../../models/classes/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private storage: Storage | null = this.isBrowser ? window.localStorage : null;

  private user$ = new BehaviorSubject<User | null>(this.loadFromStorage());
  currentUser$ = this.user$.asObservable();

  // ✅ boolean streams for templates with | async
  isLoggedIn$ = this.currentUser$.pipe(map(u => !!u));
  isUser$     = this.currentUser$.pipe(map(u => this.hasRole(u, 'user')));
  isAdmin$    = this.currentUser$.pipe(map(u => this.hasRole(u, 'admin')));

  // --- public API ---
  loginUser(user: User): void {
    this.user$.next(user);
    if (this.storage) {
      try { this.storage.setItem('currentUser', JSON.stringify(user)); } catch {}
    }
  }

  logout(): void {
    this.user$.next(null);
    if (this.storage) {
      try { this.storage.removeItem('currentUser'); } catch {}
    }
  }

  get currentUser(): User | null {
    return this.user$.value;
  }

  // --- helpers ---
  private loadFromStorage(): User | null {
    if (!this.storage) return null; // SSR-safe
    try {
      const raw = this.storage.getItem('currentUser');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private hasRole(u: User | null, role: string): boolean {
    if (!u || !u.userRole) return false;
    const roles = Array.isArray(u.userRole) ? u.userRole : [u.userRole];
    return roles.includes(role);
  }
}
