import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HistoryService } from '../../services/history.service';
import { StabilityHistoryResult } from '../../models/history.models';
import { VarianceChartComponent } from '../../../shared/charts/variance-chart.component';

@Component({
  selector: 'app-stability-variance',
  standalone: true,
  imports: [CommonModule, VarianceChartComponent],
  templateUrl: './stability-variance.component.html',
  styleUrls: ['./stability-variance.component.scss']
})
export class StabilityVarianceComponent implements OnInit {
  isLoading = false;
  error = '';
  results: StabilityHistoryResult[] = [];

  constructor(private historyService: HistoryService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error = '';
    this.historyService.getStability().subscribe({
      next: (data) => {
        this.results = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load stability history', err);
        this.error = 'Failed to load stability history.';
        this.isLoading = false;
      }
    });
  }

  private getAverages() {
    if (!this.results.length) return { estVar: 0, rtVar: 0 };
    const estVar =
      this.results.reduce((s, r) => s + r.estimationVariance, 0) /
      this.results.length;
    const rtVar =
      this.results.reduce((s, r) => s + r.responseTimeVariance, 0) /
      this.results.length;
    return { estVar, rtVar };
  }

  get varianceBars(): { label: string; value: number }[] {
    const a = this.getAverages();
    return [
      { label: 'Estimation variance', value: a.estVar },
      { label: 'Response time variance', value: a.rtVar }
    ];
  }
}
