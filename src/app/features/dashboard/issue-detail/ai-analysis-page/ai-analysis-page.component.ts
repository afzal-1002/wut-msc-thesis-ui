import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AiService } from '../../../../services/ai/ai.service';
import { AiIssueAnalysis } from '../../../../models/interface/ai-response.interface';
import { AiAnalyzeRequest, AiBackendModel } from '../../../../models/interface/ai-analysis-options.interface';
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
  isLoading = false;
  errorMessage = '';
  analysis: AiIssueAnalysis | null = null;
  isUpdating = false;
  updateSuccessMessage = '';

  // configuration state for AI request
  aiModel: AiBackendModel | null = null;
  markdown = true;
  explanation = true;
  userPrompt = '';
  temperature = 5.0;

  // selection state
  selectedCommentIndexes = new Set<number>();
  includeGeneration = true;
  visibilityRole = 'Administrators';

  // when both models are requested, allow choosing which response to use for Jira comment
  commentModelChoice: AiBackendModel = 'DEEPSEEK';

  // optional selection of specific markdown sections from the chosen AI response
  sectionSelections: { title: string; content: string; selected: boolean }[] = [];

  // Quick comment addition
  newCommentText = '';
  addCommentInProgress = false;
  addCommentErrorMessage = '';

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
        return;
      }
      // Wait for user to configure options and click Run Analysis
    });
  }

  runAnalysis(): void {
    if (!this.issueKey || this.isLoading) {
      return;
    }

    if (!this.aiModel) {
      this.errorMessage = 'Please select an AI model before requesting analysis.';
      return;
    }

    const request: AiAnalyzeRequest = {
      issueKey: this.issueKey,
      userPrompt: this.userPrompt || '',
      markdown: this.markdown,
      explanation: this.explanation,
      aiModel: this.aiModel,
      temperature: this.temperature
    };

    this.isLoading = true;
    this.errorMessage = '';
    this.analysis = null;

    this.aiService.analyzeIssue(request).subscribe({
      next: (res: AiIssueAnalysis) => {
        this.isLoading = false;

        const raw: any = res as any;
        const deepseekText = raw.deepseek || '';
        const geminiText = raw.gemini || '';

        let generation = res.generation || '';
        if (!generation) {
          if (request.aiModel === 'DEEPSEEK') {
            generation = deepseekText;
          } else if (request.aiModel === 'GEMINI') {
            generation = geminiText;
          } else if (request.aiModel === 'BOTH') {
            generation = deepseekText || geminiText || '';
          }
        }

        this.analysis = {
          ...res,
          generation,
          deepseek: deepseekText || undefined,
          gemini: geminiText || undefined
        };

        // default comment model choice when BOTH is used
        if (request.aiModel === 'BOTH') {
          this.commentModelChoice = deepseekText ? 'DEEPSEEK' : 'GEMINI';
        } else {
          this.commentModelChoice = request.aiModel;
        }

        this.rebuildSectionSelections();

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

    if (this.includeGeneration) {
      // If user picked specific sections, join only those; otherwise use the full response
      const pickedSections = this.sectionSelections.filter(s => s.selected);
      let generationText = '';

      if (pickedSections.length > 0) {
        generationText = pickedSections.map(s => s.content).join('\n\n');
      } else {
        generationText = this.getCurrentModelTextForComment();
      }

      if (generationText) {
        texts.push(generationText);
      }
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

    // Build AI Analysis header with metadata
    const content = this.buildAIAnalysisCommentContent(texts);

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
        
        // Handle specific error cases
        if (err?.status === 409) {
          this.errorMessage = '⚠️ Comment conflict: This comment already exists in Jira. The backend needs to be updated to handle existing comments. Please contact your administrator.';
        } else if (err?.status === 405 || err?.message?.includes('PUT')) {
          this.errorMessage = '⚠️ Update method not available: The backend is being updated to support comment updates. Please try again later.';
        } else {
          this.errorMessage = err?.error?.message || err?.message || 'Failed to update Jira comment.';
        }
      }
    });
  }

  /**
   * Add a new Jira comment with the user's text
   * Uses the same API endpoint as the issue details page
   */
  addComment(): void {
    if (!this.analysis || !this.newCommentText.trim() || this.addCommentInProgress) {
      return;
    }

    const text = this.newCommentText.trim();
    const issueKey = this.analysis.issueKey || this.issueKey;

    const request: JiraCommentUpdateRequest = {
      body: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text
              }
            ]
          }
        ]
      }
    };

    this.addCommentInProgress = true;
    this.addCommentErrorMessage = '';

    this.jiraCommentService.createComment(issueKey, request).subscribe({
      next: () => {
        this.addCommentInProgress = false;
        this.newCommentText = '';
        this.updateSuccessMessage = '✅ Comment added to Jira successfully!';
        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          this.updateSuccessMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        this.addCommentInProgress = false;
        console.error('Failed to add comment', err);
        
        if (err?.status === 409) {
          this.addCommentErrorMessage = '⚠️ Comment conflict: A similar comment already exists. Please contact your administrator.';
        } else {
          this.addCommentErrorMessage = err?.error?.message || err?.message || 'Failed to add comment.';
        }
      }
    });
  }

  onCommentModelChoiceChange(): void {
    this.rebuildSectionSelections();
  }

  private getCurrentModelTextForComment(): string {
    if (!this.analysis) {
      return '';
    }

    let base = this.analysis.generation || '';

    if (this.aiModel === 'DEEPSEEK' && this.analysis.deepseek) {
      base = this.analysis.deepseek;
    } else if (this.aiModel === 'GEMINI' && this.analysis.gemini) {
      base = this.analysis.gemini;
    } else if (this.aiModel === 'BOTH') {
      if (this.commentModelChoice === 'DEEPSEEK' && this.analysis.deepseek) {
        base = this.analysis.deepseek;
      } else if (this.commentModelChoice === 'GEMINI' && this.analysis.gemini) {
        base = this.analysis.gemini;
      }
    }

    return base || '';
  }

  private rebuildSectionSelections(): void {
    const text = this.getCurrentModelTextForComment();
    this.sectionSelections = [];

    if (!text) {
      return;
    }

    const lines = text.split(/\r?\n/);
    let currentTitle = '';
    let currentLines: string[] = [];

    const pushCurrent = () => {
      if (currentTitle) {
        this.sectionSelections.push({
          title: currentTitle,
          content: currentLines.join('\n'),
          selected: false
        });
      }
    };

    for (const line of lines) {
      const match = line.match(/^(#{2,6})\s+(.*)$/); // H2+ headings
      if (match) {
        pushCurrent();
        currentTitle = match[2].trim();
        currentLines = [line];
      } else if (currentTitle) {
        currentLines.push(line);
      }
    }

    pushCurrent();
  }

  private buildAtlassianContentFromTexts(texts: string[]): any[] {
    const docContent: any[] = [];

    const flushBulletList = (items: any[]) => {
      if (items.length > 0) {
        docContent.push({
          type: 'bulletList',
          content: items
        });
      }
    };

    for (const text of texts) {
      const lines = (text || '').split(/\r?\n/);
      let bulletItems: any[] = [];

      for (const rawLine of lines) {
        const line = rawLine.replace(/\s+$/g, '');
        const trimmed = line.trim();

        if (!trimmed) {
          flushBulletList(bulletItems);
          bulletItems = [];
          continue;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
          flushBulletList(bulletItems);
          bulletItems = [];

          const level = Math.min(headingMatch[1].length, 6);
          const headingText = this.stripInlineMarkdown(headingMatch[2]);

          docContent.push({
            type: 'heading',
            attrs: { level },
            content: [
              {
                type: 'text',
                text: headingText
              }
            ]
          });
          continue;
        }

        const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
        if (bulletMatch) {
          const itemText = this.stripInlineMarkdown(bulletMatch[1]);
          bulletItems.push({
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: itemText
                  }
                ]
              }
            ]
          });
          continue;
        }

        flushBulletList(bulletItems);
        bulletItems = [];

        const cleanedLine = this.stripInlineMarkdown(line);

        docContent.push({
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: cleanedLine
            }
          ]
        });
      }

      flushBulletList(bulletItems);
      bulletItems = [];

      // add a blank paragraph between different text blocks to improve spacing
      docContent.push({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: ''
          }
        ]
      });
    }

    return docContent;
  }

  /**
   * Build complete AI Analysis comment with header, metadata, and formatted content
   * Follows ADF (Atlassian Document Format) for Jira comments
   */
  private buildAIAnalysisCommentContent(texts: string[]): any[] {
    const docContent: any[] = [];

    // Add AI Analysis header with strong formatting
    docContent.push({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: '🤖 AI Analysis',
          marks: [{ type: 'strong' }]
        },
        {
          type: 'text',
          text: ` | Model: ${this.aiModel === 'BOTH' ? this.commentModelChoice : this.aiModel}`
        }
      ]
    });

    // Add metadata line
    const timestamp = new Date().toLocaleString();
    docContent.push({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: `Generated: ${timestamp}`,
          marks: [{ type: 'code' }]
        }
      ]
    });

    // Add separator/spacing
    docContent.push({
      type: 'paragraph',
      content: [{ type: 'text', text: '' }]
    });

    // Add the main content with proper ADF formatting
    const mainContent = this.buildAtlassianContentFromTexts(texts);
    docContent.push(...mainContent);

    return docContent;
  }

  private stripInlineMarkdown(text: string): string {
    if (!text) {
      return '';
    }

    // remove bold markers **text** but keep the inner text
    let cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1');

    // optionally, collapse multiple spaces left behind
    cleaned = cleaned.replace(/ {2,}/g, ' ');

    return cleaned;
  }
}
