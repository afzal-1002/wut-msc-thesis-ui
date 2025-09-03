import { Component } from '@angular/core';
import { User } from '../../../../models/user.model';
import { UserService } from '../../../../services/user/user.service';
import { ActivatedRoute } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [NgFor],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {

  userList: User[] = [];
  adminUser: User | null | undefined = null;

  features = [
    { icon: '📁', title: 'Projects', description: 'Manage your projects' },
    { icon: '🐞', title: 'Bugs', description: 'Track and report bugs' },
    { icon: '🤖', title: 'AI Estimations', description: 'Predict bug fix time' },
    { icon: '📊', title: 'History', description: 'View past estimates' },
    { icon: '🔔', title: 'Notifications', description: 'Stay up to date' },
    { icon: '👤', title: 'Profile', description: 'Edit your profile' }
  ];


  constructor(private userService: UserService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    console.log("inside admin dash board");
    this.userList = this.userService.getAllUsers();

    const userIdParam = this.activatedRoute.snapshot.paramMap.get('id');
    const userId = userIdParam ? parseInt(userIdParam, 10) : null;

    if (userId) {
      this.adminUser = this.userList.find(
        user => user.id === userId && user.userRole.some(role => role.toLowerCase() === 'admin')
      ) || null;

    }

    if (!this.adminUser) {
      console.log('❌ No user found');
    } else {
      console.log('✅ User found:', this.adminUser);
    }
  }





}
