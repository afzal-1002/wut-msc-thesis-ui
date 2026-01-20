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

    // First check if AI comments already exist
    this.jiraCommentService.getAIComments(issueKey).subscribe({
      next: (existingComments: any[]) => {
        if (existingComments && existingComments.length > 0) {
          // AI comments already exist
          this.isUpdating = false;
          this.errorMessage = `⚠️ AI Analysis Comments Already Exist: This issue already has ${existingComments.length} AI analysis comment(s).

To add a new comment:
1️⃣  Go back to the issue details page
2️⃣  Delete the existing AI analysis comment(s) first
3️⃣  Return here and try adding a new comment

Or modify your current AI Analysis comment by selecting different sections.`;
        } else {
          // No existing AI comments, safe to add new one
          this.createNewComment(issueKey, request);
        }
      },
      error: (err: any) => {
        // If getAIComments fails, try to create anyway
        console.warn('Could not check existing AI comments, attempting to create:', err);
        this.createNewComment(issueKey, request);
      }
    });
  }

  /**
   * Helper method to create a new Jira comment
   */
  private createNewComment(issueKey: string, request: JiraCommentUpdateRequest): void {
    this.jiraCommentService.createComment(issueKey, request).subscribe({
      next: () => {
        this.isUpdating = false;
        this.updateSuccessMessage = '✅ Comment added to Jira successfully with selected AI content.';
        // Reset selections after successful submission
        this.selectedCommentIndexes.clear();
        this.includeGeneration = true;
        setTimeout(() => {
          this.updateSuccessMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        this.isUpdating = false;
        console.error('Failed to add comment', err);
        
        // Handle specific error cases
        if (err?.status === 409) {
          this.errorMessage = `⚠️ Comment Conflict: A similar AI analysis comment already exists on this issue.
          
To resolve:
1️⃣  Go back to the issue and delete the existing AI analysis comment
2️⃣  Return here and try adding the comment again
3️⃣  Or select DIFFERENT sections from the analysis

If the issue has multiple AI comments, delete all of them and try again.`;
        } else {
          this.errorMessage = err?.error?.message || err?.message || 'Failed to add comment.';
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
