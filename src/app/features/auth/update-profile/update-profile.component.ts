import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user/user.service'; 
import { User } from '../../../models/user.model'; 

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  imports: [ReactiveFormsModule]
})
export class UpdateProfileComponent implements OnInit {
  updateForm!: FormGroup;
  userId!: number;
  userData!: User;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

   const user:  User | undefined  = this.userService.getUserById(this.userId);
   
      if (user) {
        this.userData = user;
        this.updateForm = this.fb.group({
          userName: [user.userName],
          firstName: [user.firstName],
          lastName: [user.lastName],
          userEmail: [user.userEmail],
          phoneNumber: [user.phoneNumber],
          userPassword: [user.password]
        });
      }

  }

  onSubmit() {
    if (this.updateForm.valid) {
      console.log('Updated user data:', this.updateForm.value);
      // Update user in array if needed (optional logic here)
      this.router.navigate(['/home']);

    }
  }
}
