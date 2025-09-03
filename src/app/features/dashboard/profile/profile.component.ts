import { JsonPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user/user.service';
import { User } from '../../../models/classes/user.model';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterModule] ,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})


export class ProfileComponent {
  firstName = "Muhammd";
  lastName = "Afzal"
  fullName = "";
  loginName : string | null | undefined = '';

  userService: UserService = new UserService();
  userList: User[] = this.userService.getAllUsers();
  

  hello() {
    alert("function_called");
    this.fullName = this.firstName + " " + this.lastName;

  }

  // constructor(private route: ActivatedRoute) {
  //   this.route.params.subscribe(params => {
  //     console.log('User ID:', params['id']);
  //   });
  // }

   userData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');



  user: any;

  // constructor(private router: Router) {
  //   const nav = this.router.getCurrentNavigation?.(); // use optional chaining to avoid call if it's undefined
  //   this.user = nav?.extras?.state?.['user'] ?? history.state?.user;

  //   console.log('User from navigation or state:', this.user);
  // }

    constructor(private activatedRoute: ActivatedRoute) {}

    ngOnInit()
    {
      this.loginName = this.activatedRoute.snapshot.queryParamMap.get('userName');
      this.user = this.userList.find( (item) => item.userName === this.loginName)
      console.log(this.loginName)
    }

}
