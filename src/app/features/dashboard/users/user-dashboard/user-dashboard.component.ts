import { Component, OnInit } from '@angular/core';
import { User } from '../../../../models/user.model';
import { UserService } from '../../../../services/user/user.service';
import { ActivatedRoute } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-user-dashboard',
  imports: [NgFor],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  userList: User[] = [];
  user: User | null | undefined = null;

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
    this.userList = this.userService.getAllUsers();

    const userIdParam = this.activatedRoute.snapshot.paramMap.get('userId');
    const userId = userIdParam ? parseInt(userIdParam, 10) : null;

    if (userId) {
      this.user = this.userList.find(user => user.id === userId) || null;
    }

    if (!this.user) {
      console.log('❌ No user found');
    } else {
      console.log('✅ User found:', this.user);
    }
  }




}