import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IssueService } from '../../../services/issue/issue.service';
import { AuthService } from '../../../services/auth/auth.service';
import { IssueResponseComponent } from './issue-response/issue-response.component';
import { BugDetailsComponent } from './bug-details/bug-details.component';
import { JiraIssueResponse } from '../../../models/interface/jira-issue.interface';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, IssueResponseComponent, BugDetailsComponent],
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.css']
})
export class IssueDetailComponent implements OnInit {
  issueKey: string = '';
  issue: JiraIssueResponse | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private issueService: IssueService,
    private authService: AuthService
  ) {}

  // Debug: log construction
  // Note: keep constructor lightweight; this log helps trace which component is created
  ngOnChanges?(): void {}

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.issueKey = params['issueKey'] || '';
      console.log('🧭 IssueDetailComponent ngOnInit, issueKey=', this.issueKey);
      if (this.issueKey) {
        this.loadIssueDetails();
      }
    });
  }

  loadIssueDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.currentUser$.subscribe((user: any) => {
      if (user && user.baseUrl) {
        this.issueService.getIssueByKey(this.issueKey, user.baseUrl).subscribe(
          (data: any) => {
            this.isLoading = false;
            console.log(`✅ Issue details loaded:`, data);
            console.log(`🔍 Issue Type:`, data.fields?.issuetype?.name);
            this.issue = data;
          },
          (error: any) => {
            this.isLoading = false;
            console.error(`❌ Failed to load issue details:`, error);
            this.errorMessage = error?.error?.message || error?.message || 'Failed to load issue details.';
          }
        );
      }
    });
  }

  getStatusClass(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('open') || statusLower.includes('to do')) {
      return 'status-open';
    }
    if (statusLower.includes('progress') || statusLower.includes('in progress')) {
      return 'status-progress';
    }
    if (statusLower.includes('done') || statusLower.includes('closed') || statusLower.includes('resolved')) {
      return 'status-done';
    }
    return 'status-default';
  }

  getPriorityClass(priority: string): string {
    const priorityLower = priority?.toLowerCase() || '';
    if (priorityLower.includes('high') || priorityLower.includes('critical')) {
      return 'priority-high';
    }
    if (priorityLower.includes('medium')) {
      return 'priority-medium';
    }
    if (priorityLower.includes('low')) {
      return 'priority-low';
    }
    return 'priority-default';
  }

  goBack(): void {
    this.router.navigate(['/issues', this.issue?.fields?.project?.key || 'BUG']);
  }
}
