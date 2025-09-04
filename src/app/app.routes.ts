// app.routes.ts
import { Routes } from '@angular/router';
import { AboutComponent } from './shared/component/about/about.component';
import { HomeComponent } from './shared/component/home/home.component';
import { LoginComponent } from './features/authentication/login/login.component';
import { ContactComponent } from './shared/component/contact/contact.component';
import { NotFoundComponent } from './features/error/not-found/not-found.component';
import { UserDashboardComponent } from './features/dashboard/user-dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './features/dashboard/admin-dashboard/admin-dashboard.component';
import { RegisterComponent } from './features/authentication/registe-user/register.component';
import { ResetPassowrdComponent } from './features/authentication/reset-passowrd/reset-passowrd.component';
import { UserProfileComponent } from './features/authentication/user-profile/user-profile.component';
import { UpdateProfileComponent } from './features/authentication/update-profile/update-profile.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'contact', component: ContactComponent },

    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    // Profile routes
    { path: 'user-profile/:id', component: UserProfileComponent },
    { path: 'update-profile/:id', component: UpdateProfileComponent },


    // Dashboards (by user id)
    { path: 'user-dashboard/:userId', component: UserDashboardComponent },
    { path: 'admin-dashboard/:userId', component: AdminDashboardComponent },



    // Password reset
    { path: 'resetPassword', component: ResetPassowrdComponent },

    // 404
    { path: '**', component: NotFoundComponent }
];
