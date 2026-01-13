import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AiService } from '../../../../services/ai/ai.service';
import { AiIssueAnalysis } from '../../../../models/interface/ai-response.interface';
import { AiResponseComponent } from '../ai-response/ai-response.component';
import { JiraCommentService, JiraCommentUpdateRequest } from '../../../../services/ai/jira-comment.service';

@Component({
  selector: 'app-ai-analysis-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AiResponseComponent],
  templateUrl: './ai-analysis-page.component.html',
  styleUrls: ['./ai-analysis-page.component.css']
})
export class AiAnalysisPageComponent implements OnInit {
  issueKey = '';
  isLoading = true;
  errorMessage = '';
  analysis: AiIssueAnalysis | null = null;
  isUpdating = false;
  updateSuccessMessage = '';

  // selection state
  selectedCommentIndexes = new Set<number>();
  includeGeneration = true;
  visibilityRole = 'Administrators';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aiService: AiService,
    private jiraCommentService: JiraCommentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.issueKey = params['issueKey'] || '';
      if (!this.issueKey) {
        this.errorMessage = 'Missing issue key.';
        this.isLoading = false;
        return;
      }
      this.loadAnalysis();
    });
  }

  loadAnalysis(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.analysis = null;

    this.aiService.getIssueAnalysis(this.issueKey).subscribe({
      next: (res: AiIssueAnalysis) => {
        this.isLoading = false;
        this.analysis = res;
        this.updateSuccessMessage = '';
        this.selectedCommentIndexes.clear();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Failed to load AI analysis', err);
        this.errorMessage = err?.error?.message || err?.message || 'Failed to load AI analysis.';
      }
    });
  }

  goBackToIssue(): void {
    this.router.navigate(['/issue-details', this.issueKey]);
  }

  toggleCommentSelection(index: number, checked: boolean): void {
    if (checked) {
      this.selectedCommentIndexes.add(index);
    } else {
      this.selectedCommentIndexes.delete(index);
    }
  }

  get hasSelection(): boolean {
    return this.includeGeneration || this.selectedCommentIndexes.size > 0;
  }

  updateCommentsFromSelection(): void {
    if (!this.analysis || !this.hasSelection || this.isUpdating) {
      return;
    }

    const texts: string[] = [];

    if (this.includeGeneration && this.analysis.generation) {
      texts.push(this.analysis.generation);
    }

    const comments = this.analysis.details?.comments || [];
    this.selectedCommentIndexes.forEach(index => {
      const c = comments[index];
      if (c?.title) {
        texts.push(c.title);
      }
    });

    if (texts.length === 0) {
      return;
    }

    const content = texts.map(text => ({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text
        }
      ]
    }));

    const request: JiraCommentUpdateRequest = {
      body: {
        type: 'doc',
        version: 1,
        content
      },
      visibility: {
        type: 'role',
        value: this.visibilityRole
      }
    };

    const issueKey = this.analysis.issueKey || this.issueKey;

    this.isUpdating = true;
    this.updateSuccessMessage = '';
    this.errorMessage = '';

    this.jiraCommentService.updateFullComment(issueKey, request).subscribe({
      next: () => {
        this.isUpdating = false;
        this.updateSuccessMessage = 'Jira comment updated successfully with selected AI content.';
      },
      error: (err: any) => {
        this.isUpdating = false;
        console.error('Failed to update Jira comment', err);
        this.errorMessage = err?.error?.message || err?.message || 'Failed to update Jira comment.';
      }
    });
  }
}
