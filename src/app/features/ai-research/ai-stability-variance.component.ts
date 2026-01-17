import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AiResearchEvaluationService } from '../../services/ai/ai-research-evaluation.service';
import { VarianceChartComponent } from '../../shared/charts/variance-chart.component';
import { GroupedBarChartComponent } from '../../shared/charts/grouped-bar-chart.component';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-ai-stability-variance',
  standalone: true,
  imports: [CommonModule, VarianceChartComponent, GroupedBarChartComponent],
  templateUrl: './ai-stability-variance.component.html',
  styleUrls: ['./ai-stability-variance.component.css']
})
export class AiStabilityVarianceComponent {
  isLoading = false;
  error = '';
  result: any = null;

  constructor(
    private researchService: AiResearchEvaluationService,
    private router: Router,
    private authService: AuthService
  ) {
    this.loadStability();
  }

  loadStability(): void {
    this.isLoading = true;
    this.error = '';
    this.researchService.getStabilityVariance().subscribe({
      next: (res) => {
        this.result = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Stability variance error', err);
        this.error = 'Failed to load stability and variance metrics.';
        this.isLoading = false;
      }
    });
  }

  private get stabilityRows(): any[] {
  return Array.isArray(this.result) ? this.result : [];
  }

  get varianceCategories(): string[] {
  const rows = this.stabilityRows;
  return rows.map((r: any, index: number) => (r?.aiProvider as string) || `Provider ${index + 1}`);
  }

  get estimationVariancePerProvider(): number[] {
  const rows = this.stabilityRows;
  return rows.map((r: any) => Number(r?.estimationVariance) || 0);
  }

  get responseTimeVariancePerProvider(): number[] {
  const rows = this.stabilityRows;
  return rows.map((r: any) => Number(r?.responseTimeVariance) || 0);
  }

  get varianceSummary(): { label: string; value: number }[] {
    const rows = Array.isArray(this.result) ? this.result : [];
    if (!rows.length) return [];

    // aggregate across providers (average) for a compact thesis figure
    const avgField = (field: string): number => {
      const vals = rows.map((r: any) => Number(r?.[field]) || 0).filter((v) => v > 0);
      if (!vals.length) return 0;
      const sum = vals.reduce((s, v) => s + v, 0);
      return sum / vals.length;
    };

    return [
      { label: 'Estimation variance', value: avgField('estimationVariance') },
	  { label: 'Response time variance', value: avgField('responseTimeVariance') }
    ];
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
