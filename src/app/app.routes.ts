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
import { CreateProjectComponent } from './features/dashboard/create-project/create-project.component';
import { ProjectsHomeComponent } from './features/dashboard/projects-home/projects-home.component';
import { ProjectDetailComponent } from './features/dashboard/project-detail/project-detail.component';
import { ViewProfileComponent } from './features/authentication/user-profile/view-profile.component';
import { AuthGuard } from './services/auth/auth.guard';
import { IssuesHomeComponent } from './features/dashboard/issues-home/issues-home.component';
import { IssueDetailComponent } from './features/dashboard/issue-detail/issue-detail.component';
import { AiAnalysisPageComponent } from './features/dashboard/issue-detail/ai-analysis-page/ai-analysis-page.component';
import { AiEstimationsComponent } from './features/dashboard/ai-estimations/ai-estimations.component';
import { AiEvaluationComponent } from './features/dashboard/ai-evaluation/ai-evaluation.component';
import { AiMetricsComponent } from './features/dashboard/ai-metrics/ai-metrics.component';
import { AiComparisonComponent } from './features/dashboard/ai-model-comparison/ai-comparison.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'contact', component: ContactComponent },

    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    // Profile routes
    { path: 'view-profile', component: ViewProfileComponent, canActivate: [AuthGuard] },
    { path: 'user-profile/:id', component: UserProfileComponent, canActivate: [AuthGuard] },
    { path: 'update-profile/:id', component: UpdateProfileComponent, canActivate: [AuthGuard] },

    // Project routes
    { path: 'projects', component: ProjectsHomeComponent, canActivate: [AuthGuard] },
    { path: 'view-bugs', component: ProjectsHomeComponent, canActivate: [AuthGuard] },
    { path: 'create-project', component: CreateProjectComponent, canActivate: [AuthGuard] },
    { path: 'edit-project/:key', component: CreateProjectComponent, canActivate: [AuthGuard] },
    { path: 'project-details/:key', component: ProjectDetailComponent, canActivate: [AuthGuard] },
    { path: 'issues/:key', component: IssuesHomeComponent, canActivate: [AuthGuard] },
    { path: 'issue-details/:issueKey', component: IssueDetailComponent, canActivate: [AuthGuard] },
    { path: 'issue-details/:issueKey/ai-analysis', component: AiAnalysisPageComponent, canActivate: [AuthGuard] },

    // AI estimations overview and dedicated pages
    { path: 'ai-estimations', component: AiEstimationsComponent, canActivate: [AuthGuard] },
    { path: 'ai-estimations/evaluation', component: AiEvaluationComponent, canActivate: [AuthGuard] },
    { path: 'ai-estimations/metrics', component: AiMetricsComponent, canActivate: [AuthGuard] },
    { path: 'ai-estimations/comparison', component: AiComparisonComponent, canActivate: [AuthGuard] },

    // Dashboards (by user id)
    { path: 'user-dashboard/:userId', component: UserDashboardComponent, canActivate: [AuthGuard] },
    { path: 'admin-dashboard/:userId', component: AdminDashboardComponent, canActivate: [AuthGuard] },

    // Password reset
    { path: 'resetPassword', component: ResetPassowrdComponent },

    // 404
    { path: '**', component: NotFoundComponent }
];
