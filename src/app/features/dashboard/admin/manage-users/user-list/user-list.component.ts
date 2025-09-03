import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../../../../app/core/services/Users';

@Component({
  selector: 'app-user-list',
  imports: [RouterLink, NgIf, NgFor],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  users : User[] = [];

}
