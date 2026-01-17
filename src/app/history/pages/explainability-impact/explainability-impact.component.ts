import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HistoryService } from '../../services/history.service';
import { ExplainabilityHistoryResult } from '../../models/history.models';
import { BarComparisonChartComponent } from '../../../shared/charts/bar-comparison-chart.component';

@Component({
  selector: 'app-explainability-impact',
  standalone: true,
  imports: [CommonModule, BarComparisonChartComponent, DecimalPipe],
  templateUrl: './explainability-impact.component.html',
  styleUrls: ['./explainability-impact.component.scss']
})
export class ExplainabilityImpactComponent implements OnInit {
  isLoading = false;
  error = '';
  results: ExplainabilityHistoryResult[] = [];

  constructor(private historyService: HistoryService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error = '';
    this.historyService.getExplainabilityImpact().subscribe({
      next: (data) => {
        this.results = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load explainability impact history', err);
        this.error = 'Failed to load explainability impact history.';
        this.isLoading = false;
      }
    });
  }

  private getGrouped() {
    const explained = this.results.filter((r) => r.explanationEnabled);
    const non = this.results.filter((r) => !r.explanationEnabled);
    const avg = (arr: ExplainabilityHistoryResult[]) => {
      if (!arr.length) return { error: 0, latencyMs: 0 };
      const err = arr.reduce((s, r) => s + r.avgError, 0) / arr.length;
      const lat = arr.reduce((s, r) => s + r.avgResponseTimeSec, 0) / arr.length;
      return { error: err, latencyMs: lat * 1000 };
    };
    return { explained: avg(explained), non: avg(non) };
  }

  get barLabels(): string[] {
    return ['With explanation', 'Without explanation'];
  }

  get barValues(): number[] {
    const g = this.getGrouped();
    return [g.explained.error, g.non.error];
  }

  get latencySummary(): { withMs: number; withoutMs: number } {
    const g = this.getGrouped();
    return { withMs: g.explained.latencyMs, withoutMs: g.non.latencyMs };
  }
}
