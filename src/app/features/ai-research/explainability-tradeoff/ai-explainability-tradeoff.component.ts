import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AiResearchEvaluationService } from '../../../services/ai/ai-research-evaluation.service';
import { GroupedBarChartComponent } from '../../../shared/charts/grouped-bar-chart.component';
import { AuthService } from '../../../services/auth/auth.service';
import { AiResearchChartCardComponent } from '../components/ai-research-chart-card/ai-research-chart-card.component';

@Component({
  selector: 'app-ai-explainability-tradeoff',
  standalone: true,
  imports: [CommonModule, GroupedBarChartComponent, AiResearchChartCardComponent],
  templateUrl: './ai-explainability-tradeoff.component.html',
  styleUrls: ['./ai-explainability-tradeoff.component.css', '../research-shared.css']
})
export class AiExplainabilityTradeoffComponent {
  isLoading = false;
  error = '';
  result: any = null;

  constructor(
    private researchService: AiResearchEvaluationService,
    private router: Router,
    private authService: AuthService
  ) {
    this.loadExplainability();
  }

  loadExplainability(): void {
    this.isLoading = true;
    this.error = '';
    this.researchService.getExplainabilityTradeoff().subscribe({
      next: (res) => {
        this.result = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Explainability trade-off error', err);
        this.error = 'Failed to load explainability trade-off metrics.';
        this.isLoading = false;
      }
    });
  }

  get labels(): string[] {
    return ['Explanation ON', 'Explanation OFF'];
  }

  get qualityValues(): number[] {
    const rows = Array.isArray(this.result) ? this.result : [];
    const on = rows.filter((r: any) => r?.explanationEnabled === true);
    const off = rows.filter((r: any) => r?.explanationEnabled === false);

    const avg = (items: any[], field: string): number => {
      if (!items.length) return 0;
      const sum = items.reduce((s, r) => s + (Number(r?.[field]) || 0), 0);
      return sum / items.length;
    };

    return [
      avg(on, 'avgEngineeringScore'),
      avg(off, 'avgEngineeringScore')
    ];
  }

  get latencyValues(): number[] {
    const rows = Array.isArray(this.result) ? this.result : [];
    const on = rows.filter((r: any) => r?.explanationEnabled === true);
    const off = rows.filter((r: any) => r?.explanationEnabled === false);

    const avg = (items: any[], field: string): number => {
      if (!items.length) return 0;
      const sum = items.reduce((s, r) => s + (Number(r?.[field]) || 0), 0);
      return sum / items.length;
    };

    // backend field is avgResponseTimeSec (seconds); use seconds directly for the chart
    return [
      avg(on, 'avgResponseTimeSec'),
      avg(off, 'avgResponseTimeSec')
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
