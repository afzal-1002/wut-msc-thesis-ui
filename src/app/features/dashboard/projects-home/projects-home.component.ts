import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, SlicePipe, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../../services/project/project.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-projects-home',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, SlicePipe, NgClass],
  templateUrl: './projects-home.component.html',
  styleUrls: ['./projects-home.component.css']
})
export class ProjectsHomeComponent implements OnInit {
  projects: any[] = [];
  isLoading = true;
  errorMessage = '';
  deleteConfirmationProjectId: string | null = null;
  projectSource: 'jira' | 'local' = 'jira';
  userId: number | string | null = null;

  constructor(public router: Router, private projectService: ProjectService, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    this.userId = user?.id ?? null;
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Get user from currentUser (the getter that reads from sessionStorage)
    const user = this.authService.currentUser;
    console.log('📍 Current user from getter:', user);

    if (user && user.baseUrl) {
      console.log('📍 Using baseUrl from user:', user.baseUrl);
      console.log('🔐 Making API call with credentials for user:', user.userName);
      
      const projectCall = this.projectSource === 'jira' 
        ? this.projectService.getProjectsByBaseUrl(user.baseUrl)
        : this.projectService.getLocalProjectsByBaseUrl(user.baseUrl);
      
      projectCall.subscribe(
        (data: any) => {
          this.isLoading = false;
          console.log(`✅ ${this.projectSource.toUpperCase()} Projects loaded:`, data);
          this.projects = Array.isArray(data) ? data : [data];
        },
        (error) => {
          this.isLoading = false;
          console.error(`❌ Failed to load ${this.projectSource} projects:`, error);
          this.errorMessage = error.error?.message || `Failed to load ${this.projectSource} projects. Please try again.`;
        }
      );
    } else {
      this.isLoading = false;
      this.errorMessage = 'User data not found. Please log in again.';
      console.error('❌ No user data available - user should not be here!', user);
    }
  }

  toggleProjectSource(source: 'jira' | 'local'): void {
    this.projectSource = source;
    this.loadProjects();
  }

  deleteProject(projectKey: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.projectService.deleteProject(projectKey).subscribe(
      () => {
        this.isLoading = false;
        console.log('✅ Project deleted:', projectKey);
        this.projects = this.projects.filter(p => p.key !== projectKey);
        this.deleteConfirmationProjectId = null;
      },
      (error) => {
        this.isLoading = false;
        console.error('❌ Failed to delete project:', error);
        this.errorMessage = error.error?.message || 'Failed to delete project. Please try again.';
        this.deleteConfirmationProjectId = null;
      }
    );
  }

  editProject(project: any): void {
    this.router.navigate(['/edit-project', project.key], { state: { project } });
  }

  viewProjectDetails(project: any): void {
    this.router.navigate(['/project-details', project.key], { state: { project } });
  }

  viewBugs(projectKey: string): void {
    this.router.navigate(['/issues', projectKey]);
  }

  toggleDeleteConfirmation(projectKey: string): void {
    this.deleteConfirmationProjectId = this.deleteConfirmationProjectId === projectKey ? null : projectKey;
  }

  cancelDelete(): void {
    this.deleteConfirmationProjectId = null;
  }
}
