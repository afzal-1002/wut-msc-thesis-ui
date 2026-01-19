import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueService } from '../../../services/issue/issue.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-issues-home',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule],
  templateUrl: './issues-home.component.html',
  styleUrls: ['./issues-home.component.css']
})
export class IssuesHomeComponent implements OnInit {
  projectKey: string = '';
  issues: any[] = [];
  isLoading = true;
  errorMessage = '';
  filteredIssues: any[] = [];
  searchQuery = '';
  filterStatus = '';
  filterPriority = '';
  private baseUrl: string | null = null;
  deletingIssueKey: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private issueService: IssueService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.projectKey = params['key'] || '';
      if (this.projectKey) {
        this.loadIssues();
      }
    });
  }

  loadIssues(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.currentUser$.subscribe((user: any) => {
      if (user && user.baseUrl) {
        this.baseUrl = user.baseUrl;
        this.issueService.getAllIssuesByProjectKey(this.projectKey, user.baseUrl).subscribe(
          (response: any) => {
            this.isLoading = false;
            console.log(`✅ Issues loaded for project ${this.projectKey}:`, response);
            // Response format: { issues: [...] } or direct array
            if (response?.issues && Array.isArray(response.issues)) {
              this.issues = response.issues;
            } else if (Array.isArray(response)) {
              this.issues = response;
            } else {
              this.issues = [];
            }
            this.applyFilters();
          },
          (error: any) => {
            this.isLoading = false;
            console.error(`❌ Failed to load issues:`, error);
            this.errorMessage = error?.error?.message || error?.message || 'Failed to load issues. Please try again.';
          }
        );
      }
    });
  }

  applyFilters(): void {
    this.filteredIssues = this.issues.filter((issue) => {
      const matchesSearch = !this.searchQuery || 
        issue.key?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        issue.fields?.summary?.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesStatus = !this.filterStatus || 
        issue.fields?.status?.name?.toLowerCase() === this.filterStatus.toLowerCase();
      
      const matchesPriority = !this.filterPriority || 
        issue.fields?.priority?.name?.toLowerCase() === this.filterPriority.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesPriority;
    }).sort((a, b) => {
      // Extract issue numbers from keys (e.g., "BUG-9" -> 9)
      const numA = parseInt(a.key?.split('-')[1] || '0', 10);
      const numB = parseInt(b.key?.split('-')[1] || '0', 10);
      return numA - numB; // Ascending order
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  onStatusFilterChange(status: string): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  onPriorityFilterChange(priority: string): void {
    this.filterPriority = priority;
    this.applyFilters();
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

  deleteIssue(issue: any): void {
    if (!this.baseUrl || !issue?.key) {
      return;
    }

    const issueKey = issue.key;
    this.deletingIssueKey = issueKey;
    this.errorMessage = '';

    this.issueService.deleteIssue(issueKey, this.baseUrl).subscribe({
      next: () => {
        this.deletingIssueKey = null;
        // remove from list and re-apply filters
        this.issues = this.issues.filter(i => i.key !== issueKey);
        this.applyFilters();
      },
      error: (error: any) => {
        this.deletingIssueKey = null;
        console.error(`❌ Failed to delete issue ${issueKey}:`, error);
        this.errorMessage = error?.error?.message || error?.message || 'Failed to delete issue. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  getDescription(description: any): string {
    if (!description) {
      return 'No description provided';
    }
    
    // If it's a string, return it
    if (typeof description === 'string') {
      return description;
    }
    
    // If it's an object with content property (common in Jira rich text)
    if (typeof description === 'object' && description.content) {
      // Try to extract text from content array
      if (Array.isArray(description.content)) {
        return description.content
          .map((item: any) => {
            if (item.content && Array.isArray(item.content)) {
              return item.content.map((c: any) => c.text || '').join('');
            }
            return item.text || '';
          })
          .join(' ')
          .trim() || 'No description provided';
      }
    }
    
    return 'No description provided';
  }

  viewDetails(issue: any): void {
    const issueKey = issue.key;
    // Navigate to issue details page
    this.router.navigate(['/issue-details', issueKey]);
  }
}
