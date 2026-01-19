import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AiResearchEvaluationService } from '../../../services/ai/ai-research-evaluation.service';
import { BarComparisonChartComponent } from '../../../shared/charts/bar-comparison-chart.component';
import { AuthService } from '../../../services/auth/auth.service';
import { AiResearchChartCardComponent } from '../components/ai-research-chart-card/ai-research-chart-card.component';

@Component({
  selector: 'app-ai-bias-analysis',
  standalone: true,
  imports: [CommonModule, BarComparisonChartComponent, AiResearchChartCardComponent],
  templateUrl: './ai-bias-analysis.component.html',
  styleUrls: ['./ai-bias-analysis.component.css', '../research-shared.css']
})
export class AiBiasAnalysisComponent {
  isLoading = false;
  error = '';
  result: any = null;

  constructor(
    private researchService: AiResearchEvaluationService,
    private router: Router,
    private authService: AuthService
  ) {
    this.loadBias();
  }

  loadBias(): void {
    this.isLoading = true;
    this.error = '';
    this.researchService.getBiasAnalysis().subscribe({
      next: (res) => {
        this.result = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Bias analysis error', err);
        this.error = 'Failed to load bias and error metrics.';
        this.isLoading = false;
      }
    });
  }

  get modelLabels(): string[] {
    const rows = Array.isArray(this.result) ? this.result : [];
    const labels = rows
      .map((r: any) => r?.aiProvider as string)
      .filter((v: any) => !!v);
    const unique = Array.from(new Set(labels));
    return unique.length ? unique : ['GEMINI', 'DEEPSEEK'];
  }

  get maeValues(): number[] {
    const rows = Array.isArray(this.result) ? this.result : [];
    const byProvider: Record<string, number> = {};
    for (const row of rows) {
      if (!row || !row.aiProvider) continue;
      const key = String(row.aiProvider).toUpperCase();
      byProvider[key] = row.meanAbsoluteError ?? row.mae ?? 0;
    }
    return this.modelLabels.map((label) => {
      const key = String(label).toUpperCase();
      return byProvider[key] ?? 0;
    });
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
