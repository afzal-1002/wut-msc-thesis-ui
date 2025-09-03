import { ActivatedRoute, RouterLink } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../models/classes/user.model';
import { UserService } from '../../../../services/user/user.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register-profile',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './register-profile.component.html',
  styleUrl: './register-profile.component.css'
})


export class RegisterProfileComponent implements OnInit {
  public userId: number | null = null;
  public user: User | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService
  ) {}

ngOnInit(): void {
  this.activatedRoute.params.subscribe(params => {
    const idParam = params['id'];
    this.userId = idParam ? parseInt(idParam, 10) : null;

    console.log('User ID:', this.userId);

    if (this.userId !== null) {
      this.user = this.userService.users.find(u => u.id === this.userId) ?? null;
      console.log('User Object:', this.user);
    } else {
      console.log('❌ No userId found in route');
    }
  });
}


  // ngOnInit(): void {
  //   this.activatedRoute.params.subscribe(params => {
  //     const idParam = params['id'];
  //     this.userId = idParam ? parseInt(idParam, 10) : null;

  //     console.log('User ID:', this.userId);

  //     if (this.userId !== null) {
  //       this.user = this.userService.users.find(u => u.id === this.userId) ?? null;
  //       console.log('User Object:', this.user);
  //     } else {
  //       console.log('❌ No userId found in route');
  //     }
  //   });
  // }

}

