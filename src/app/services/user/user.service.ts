import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models/classes/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/wut`;

  constructor(private http: HttpClient) {}

  // Login user with username and password
  login(username: string, password: string): Observable<any> {
    const loginPayload = { username, password };
    // Backend validates username/password from request body; no extra headers needed.
    return this.http.post(`${this.apiUrl}/users/login`, loginPayload, {
      withCredentials: true
    });
  }

  // Register new user
  register(registerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, registerData);
  }

  // Get current logged-in user from Jira with baseUrl
  getCurrentUser(baseUrl: string): Observable<any> {
    const params = { baseUrl };
    return this.http.get(`${this.apiUrl}/jira-users/me`, { params });
  }

  // Get user by username
  getUserByUserName(userName: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/username/${userName}`);
  }

  // Get all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  // Get user by ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  // Create a new user
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  // Update user
  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user);
  }

  // Delete user
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}