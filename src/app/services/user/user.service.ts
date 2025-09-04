import { Injectable } from '@angular/core';
import { OnInit } from '@angular/core';
import { User } from '../../models/classes/user.model';


@Injectable({
  providedIn: 'root'
})

export class UserService implements OnInit{

  public users: User[] = [
    new User(1, 'afzal1002', 'Muhammad', 'Afzal', 'afzal@gmail.com', "+48729294512",  '12345', ['admin'], false),
    new User(2, 'akram9001', 'Muhammad', 'Akram', 'akram@gmail.com', "+12346598745",  'pass123',['user'],false),
    new User(3, 'afzal', 'muhammad', 'afzal', 'afz@gmail.com', "+12346598745",  '12345',['user', 'admin'],false),
     new User(4, 'muhammad', 'muhammad', 'afzal', 'afzal1002@gmail.com', "+12346598745",  '12345',['user', 'admin'],false)
  ];

  constructor() {}

  ngOnInit(): void {
  }

  getUserByUserName(userName: string): User | null | undefined{
    return this.users.find( (item) => item.userName === userName);
  }

  getAllUsers(): User[] {
    return this.users;
  }

  getUserById(id: number): User | undefined  {
    const user = this.users.find((u) => u.id === id);
    return (user); // simulates an HTTP call
  }
}