import { AsyncPipe, NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { User } from "../../models/user.model";
import { AuthService } from "../../services/auth/auth.service";

@Component({
  selector: "app-header",
  standalone: true,
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
  imports: [RouterLink, NgIf, AsyncPipe]
})
export class HeaderComponent implements OnInit {
  user: User | null = null;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  logOut(): void {
    this.authService.logout(); // Clear login state
    this.router.navigate(['home'], { queryParams: { userLogedin: false } });
  }

  userLoggedIn(): void {
    this.router.navigate(['login'], { queryParams: { userLogedin: false } });
  }

  isAdmin(): boolean {
    return this.user?.userRole.includes('admin') ?? false;
  }

  isUser(): boolean {
    return this.user?.userRole.includes('user') ?? false;
  }
}
