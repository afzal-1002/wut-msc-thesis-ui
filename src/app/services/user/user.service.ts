import { Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  public users: User[] = [
    new User(1, 'afzal1002', 'Muhammad', 'Afzal', 'afzal@gmail.com', "+48729294512",  '12345', ['admin'], false),
    new User(2, 'akram9001', 'Muhammad', 'Akram', 'akram@gmail.com', "+12346598745",  'pass123',['user'],false),
    new User(3, 'afzal', 'muhammad', 'afzal', 'afz@gmail.com', "+12346598745",  '12345',['user', 'admin'],false)
  ];

  // private apiUrl = 'http://localhost:8080/api/users'
  // constructor(private http: HttpClient) {}


  private _currentUser: User | null = null;

  login(userName: string, password: string): boolean {
    const matchedUser = this.users.find(
      user => user.userName === userName && user.password === password
    );

    if (matchedUser) {
      matchedUser.isLoggedIn = true;
      this._currentUser = matchedUser;
      return true;
    }

    return false;
  }



  getUserByUserName(userName: string): User | null | undefined{
    return this.users.find( (item) => item.userName === userName);
  }

  isLoggedIn(): boolean {
    return this._currentUser?.isLoggedIn || false;
  }

  logout() {
    if (this._currentUser) {
      this._currentUser.isLoggedIn = false;
      this._currentUser = null;
    }
  }

  getAllUsers(): User[] {
    return this.users;
  }

  // getUserById(id: number): Observable<User> {
  //   return this.http.get<User>(`${this.apiUrl}/${id}`);
  // }

  // updateUser(id: number, userData: any): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/${id}`, userData);
  // }

constructor() {}

  getUserById(id: number): User | undefined  {
    const user = this.users.find((u) => u.id === id);
    return (user); // simulates an HTTP call
  }
}