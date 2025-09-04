import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { User } from '../../../models/classes/user.model';
import { UserService } from '../../../services/user/user.service';
import { UserSessionService } from '../../../services/user-session/user-session.service';


@Component({
  selector: 'app-user-dashboard',
   imports: [NgFor, NgIf], 
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  userList: User[] = [];
  user: User | null | undefined = null;
 
 features = [
   // User features
   { icon: '📁', title: 'Projects',       description: 'Manage your projects',       button: 'View Projects',  link: '/view-projects' },
   { icon: '🐞', title: 'Bugs',           description: 'Track and report bugs',      button: 'View Bugs',      link: '/view-bugs' },
   { icon: '🤖', title: 'AI Estimations', description: 'Predict bug fix time',       button: 'AI Analysis',    link: '/ai-analysis' },
   { icon: '📊', title: 'View History',   description: 'View past estimates',        button: 'History',        link: '/check-history' },
    { icon: '🔔', title: 'Notifications',  description: 'Stay up to date',            button: 'Alerts',         link: '/notifications' },
    { icon: '👤', title: 'Profile',        description: 'Edit your profile',          button: 'My Profile',     link: '/user-profile' },

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
 
     if (link.startsWith('/user-profile')) {
       this.router.navigate(['/user-profile', this.user?.id]);
     }
   }

   viewProfile(): void {
    if (this.user?.id != null) {
      this.router.navigate(['user-profile', this.user.id]);
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  } 
 }
 