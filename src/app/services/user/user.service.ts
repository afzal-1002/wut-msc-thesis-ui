import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models/classes/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  // Login user with username and password
  login(username: string, password: string): Observable<any> {
    const loginPayload = { username, password };
    // Backend validates username/password from request body; no extra headers needed.
    return this.http.post('/api/wut/users/login', loginPayload, {
      withCredentials: true
    });
  }

  // Register new user
  register(registerData: any): Observable<any> {
    return this.http.post('/api/wut/users/register', registerData);
  }

  // Get current logged-in user from Jira with baseUrl
  getCurrentUser(baseUrl: string): Observable<any> {
    const params = { baseUrl };
    return this.http.get('/api/wut/jira-users/me', { params });
  }

  // Get user by username
  getUserByUserName(userName: string): Observable<User> {
    return this.http.get<User>(`/api/wut/users/username/${userName}`);
  }

  // Get all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`/api/wut/users`);
  }

  // Get user by ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`/api/wut/users/${id}`);
  }

  // Create a new user
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`/api/wut/users`, user);
  }

  // Update user
  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`/api/wut/users/${id}`, user);
  }

  // Delete user
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`/api/wut/users/${id}`);
  }
}