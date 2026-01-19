import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AiResearchEvaluationService } from '../../../services/ai/ai-research-evaluation.service';
import { GroupedBarChartComponent } from '../../../shared/charts/grouped-bar-chart.component';
import { AuthService } from '../../../services/auth/auth.service';
import { AiResearchChartCardComponent } from '../components/ai-research-chart-card/ai-research-chart-card.component';

@Component({
  selector: 'app-ai-human-in-loop',
  standalone: true,
  imports: [CommonModule, GroupedBarChartComponent, AiResearchChartCardComponent],
  templateUrl: './ai-human-in-loop.component.html',
  styleUrls: ['./ai-human-in-loop.component.css', '../research-shared.css']
})
export class AiHumanInTheLoopComponent {
  isLoading = false;
  error = '';
  result: any = null;

  constructor(
    private researchService: AiResearchEvaluationService,
    private router: Router,
    private authService: AuthService
  ) {
    this.loadHumanInLoop();
  }

  loadHumanInLoop(): void {
    this.isLoading = true;
    this.error = '';
    this.researchService.getHumanInLoopImpact().subscribe({
      next: (res) => {
        this.result = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Human-in-the-loop error', err);
        this.error = 'Failed to load human-in-the-loop impact metrics.';
        this.isLoading = false;
      }
    });
  }

  get labels(): string[] {
    return ['With user prompt', 'Without user prompt'];
  }

  get qualityValues(): number[] {
    const rows = Array.isArray(this.result) ? this.result : [];
    const withPrompt = rows.filter((r: any) => r?.userPromptProvided === true);
    const withoutPrompt = rows.filter((r: any) => r?.userPromptProvided === false);

    const avg = (items: any[], field: string): number => {
      if (!items.length) return 0;
      const sum = items.reduce((s, r) => s + (Number(r?.[field]) || 0), 0);
      return sum / items.length;
    };

    return [
      avg(withPrompt, 'avgEngineeringScore'),
      avg(withoutPrompt, 'avgEngineeringScore')
    ];
  }

  get relevanceValues(): number[] {
    const rows = Array.isArray(this.result) ? this.result : [];
    const withPrompt = rows.filter((r: any) => r?.userPromptProvided === true);
    const withoutPrompt = rows.filter((r: any) => r?.userPromptProvided === false);

    const avg = (items: any[], field: string): number => {
      if (!items.length) return 0;
      const sum = items.reduce((s, r) => s + (Number(r?.[field]) || 0), 0);
      return sum / items.length;
    };

    // fallback: if no explicit relevance score, reuse engineering score as relevance proxy
    const withRel = avg(withPrompt, 'relevanceScore') || avg(withPrompt, 'avgEngineeringScore');
    const withoutRel = avg(withoutPrompt, 'relevanceScore') || avg(withoutPrompt, 'avgEngineeringScore');

    return [withRel, withoutRel];
  }

  get hasRelevance(): boolean {
    const rows = Array.isArray(this.result) ? this.result : [];
    return rows.some((r: any) => r?.relevanceScore != null || r?.avgEngineeringScore != null);
  }

  goBack(): void {
  const user = this.authService.currentUser;
  if (user && user.id != null) {
    this.router.navigate(['user-dashboard', user.id]);
  } else if (window.history.length > 1) {
    window.history.back();
  } else {
    this.router.navigate(['/']);
  }
  }
}
