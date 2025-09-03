import { Component, OnInit } from '@angular/core';
import { User } from '../../../../models/classes/user.model';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../services/user/user.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  imports: [NgIf],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit{

  user: User | null | undefined = null;
  userList: User[] = [];

  constructor(private activatedRoute: ActivatedRoute,private userService: UserService){}

  ngOnInit(): void {
    this.userList = this.userService.getAllUsers();

    const userIdParam = this.activatedRoute.snapshot.queryParamMap.get('userId');
    const userId = userIdParam ? parseInt(userIdParam, 10) : null;
    this.user = this.userList.find( (user) => user.id === userId);

  }




}
