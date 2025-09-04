// admin-dashboard.component.ts
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { User } from '../../../models/classes/user.model';
import { UserService } from '../../../services/user/user.service';
import { UserSessionService } from '../../../services/user-session/user-session.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink], 
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'] // <-- plural
})
export class AdminDashboardComponent {
  userList: User[] = [];
  user: User | null | undefined = null;

features = [
  // User features
  { icon: '📁', title: 'Projects',       description: 'Manage your projects',       button: 'View Projects',  link: '/view-projects' },
  { icon: '🐞', title: 'Bugs',           description: 'Track and report bugs',      button: 'View Bugs',      link: '/view-bugs' },
  { icon: '🤖', title: 'AI Estimations', description: 'Predict bug fix time',       button: 'AI Analysis',    link: '/ai-analysis' },
  { icon: '📊', title: 'View History',   description: 'View past estimates',        button: 'History',        link: '/check-history' },

  // Admin-specific features
  { icon: '👥', title: 'User Management', description: 'Add, edit, or remove users', button: 'Manage Users',   link: '/admin/users' },
  { icon: '⚙️', title: 'System Settings', description: 'Configure system preferences', button: 'Settings',     link: '/admin/settings' },
  { icon: '📑', title: 'Reports',        description: 'View detailed usage reports', button: 'View Reports',   link: '/admin/reports' },
  { icon: '🛡️', title: 'Roles & Access', description: 'Manage roles and permissions', button: 'Access Control', link: '/admin/roles' },
  { icon: '📦', title: 'Modules',        description: 'Enable or disable modules',  button: 'Manage Modules',  link: '/admin/modules' }
];


  constructor(
    private userService: UserService,
    private session: UserSessionService, 
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userList = this.userService.getAllUsers();
    this.user = sessionStorage.getItem('currentUser') ? JSON.parse(sessionStorage.getItem('currentUser') || '{}') : null;
    const userIdParam = this.activatedRoute.snapshot.paramMap.get('userId');
    const userId = userIdParam ? parseInt(userIdParam, 10) : null;

    if (userId != null) {
      this.user = this.userList.find(u => u.id === userId) ?? this.user;
    }

    console.log(this.user ? '✅ User found:' : '❌ No user found', this.user);
  }

  goToLink(link: string): void {
    console.log('Navigating to:', link);
    console.log('Current user:', this.user);
    if (!this.user) {
      console.warn('No user logged in. Redirecting to login page.');
      this.router.navigate(['/login']);
      return;
    }

    if (link.startsWith('/admin') && !this.user.userRole.includes('admin')) {
      console.warn('Access denied. User is not an admin.');
      alert('Access denied. Admins only.');
      return;
    }

    if (link.startsWith('/view-profile')) {
      this.router.navigate(['/view-profile', this.user?.id]);
    }
  }
}
