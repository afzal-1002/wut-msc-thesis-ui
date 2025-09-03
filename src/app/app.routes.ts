import { Routes } from '@angular/router';
import { AboutComponent } from './shared/about/about.component';
import { HomeComponent } from './shared/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ContactComponent } from './shared/contact/contact.component';
import { NotFoundComponent } from './features/error/not-found/not-found.component';
import { ProfileComponent } from './features/dashboard/profile/profile.component';
import { UserDashboardComponent } from './features/dashboard/users/user-dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './features/dashboard/admin/admin-dashboard/admin-dashboard.component';
import { RegisterComponent } from './features/auth/registe-user/register/register.component';
import { RegisterProfileComponent } from './features/auth/registe-user/registered-profile/register-profile.component';
import { ResetPassowrdComponent } from './features/auth/registe-user/reset-passowrd/reset-passowrd.component';
import { UpdateProfileComponent } from './features/auth/update-profile/update-profile.component';
import { UserProfileComponent } from './features/dashboard/users/user-profile/user-profile.component';


export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'home', component: HomeComponent },
    { path: 'home/:newUser', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'viewprofile', component: ProfileComponent },
    { path: 'registerProfile/:id', component: RegisterProfileComponent },
    { path: 'updateUserProfile/:id', component: UpdateProfileComponent },
    { path: 'viewprofile/:id', component: ProfileComponent },
    { path: 'view-profile/:id', component: UserProfileComponent },
    { path: 'user-dashboard/:userId', component: UserDashboardComponent },
    { path: 'admin-dashboard/:id', component: AdminDashboardComponent },
    { path: 'resetPassword', component: ResetPassowrdComponent },
    { path: 'contact', component: ContactComponent },
    { path: '**', component: NotFoundComponent }
];
