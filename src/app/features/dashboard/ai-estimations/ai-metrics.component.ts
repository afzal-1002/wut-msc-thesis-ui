import { Component } from '@angular/core';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, ChartOptions, ChartType } from 'chart.js';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { AiEstimationsService } from '../../../services/ai/ai-estimations.service';
import { Router } from '@angular/router';

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-ai-metrics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './ai-metrics.component.html',
  styleUrls: ['./ai-metrics.component.css']
})
export class AiMetricsComponent {
    providerBarType: 'bar' = 'bar';
    markdownPieType: 'pie' = 'pie';
  providerBarData: { labels: string[]; datasets: Array<any> } = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Avg Resolution Time (h)',
        backgroundColor: ['#22c55e', '#60a5fa', '#a78bfa', '#fbbf24'],
        borderRadius: 8,
        maxBarThickness: 40
      }
    ]
  };
  providerBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        anchor: 'end' as const,
        align: 'end' as const,
        color: '#222',
        font: { weight: 'bold' as const, size: 13 },
        formatter: function(value: any) {
          if (typeof value === 'number') {
            return value.toFixed(2);
          }
          return value;
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#eee' } }
    }
  };

  // Chart.js Pie chart config for Markdown ON/OFF
  markdownPieData: { labels: string[]; datasets: Array<any> } = {
    labels: ['Markdown ON', 'Markdown OFF'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#22c55e', '#60a5fa'],
        borderColor: ['#14532d', '#1d4ed8'],
        borderWidth: 2
      }
    ]
  };
  markdownPieOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      datalabels: {
        color: '#222',
        font: { weight: 'bold' as const, size: 14 },
        formatter: function(value: any) {
          if (typeof value === 'number') {
            return value;
          }
          return value;
        }
      }
    }
  };
  activeMetricsTab: 'metrics-issue' | 'metrics-model' | 'hours-le' | 'hours-gt' | 'days-le' | 'days-gt' | 'markdown-on' | 'markdown-off' | 'explanation-on' | 'explanation-off' = 'metrics-issue';

  metricsIssueKey = '';
  metricsProvider = '';
  hoursThreshold: number | null = null;
  daysThreshold: number | null = null;

  metricsResult: any = null;
  isLoadingMetrics = false;
  metricsError = '';

  constructor(private aiEstimationsService: AiEstimationsService, private router: Router) {}

  goBack(): void {
    this.router.navigate(['/ai-estimations']);
  }

  runMetricsQuery(): void {
    this.metricsError = '';
    this.metricsResult = null;
    this.isLoadingMetrics = true;

    let request$;

    switch (this.activeMetricsTab) {
      case 'metrics-issue':
        if (!this.metricsIssueKey) {
          this.metricsError = 'Please enter an issue key.';
          this.isLoadingMetrics = false;
          return;
        }
        request$ = this.aiEstimationsService.getMetricsByIssue(this.metricsIssueKey.trim());
        break;
      case 'metrics-model':
        if (!this.metricsProvider) {
          this.metricsError = 'Please enter an AI provider (e.g. GEMINI, DEEPSEEK).';
          this.isLoadingMetrics = false;
          return;
        }
        request$ = this.aiEstimationsService.getMetricsByProvider(this.metricsProvider.trim());
        break;
      case 'hours-le':
        if (this.hoursThreshold == null) {
          this.metricsError = 'Please enter a number of hours.';
          this.isLoadingMetrics = false;
          return;
        }
        request$ = this.aiEstimationsService.getMetricsByHoursLte(this.hoursThreshold);
        break;
      case 'hours-gt':
        if (this.hoursThreshold == null) {
          this.metricsError = 'Please enter a number of hours.';
          this.isLoadingMetrics = false;
          return;
        }
        request$ = this.aiEstimationsService.getMetricsByHoursGt(this.hoursThreshold);
        break;
      case 'days-le':
        if (this.daysThreshold == null) {
          this.metricsError = 'Please enter a number of days.';
          this.isLoadingMetrics = false;
          return;
        }
        request$ = this.aiEstimationsService.getMetricsByDaysLte(this.daysThreshold);
        break;
      case 'days-gt':
        if (this.daysThreshold == null) {
          this.metricsError = 'Please enter a number of days.';
          this.isLoadingMetrics = false;
          return;
        }
        request$ = this.aiEstimationsService.getMetricsByDaysGt(this.daysThreshold);
        break;
      case 'markdown-on':
        request$ = this.aiEstimationsService.getMetricsByMarkdown(true);
        break;
      case 'markdown-off':
        request$ = this.aiEstimationsService.getMetricsByMarkdown(false);
        break;
      case 'explanation-on':
        request$ = this.aiEstimationsService.getMetricsByExplanation(true);
        break;
      case 'explanation-off':
        request$ = this.aiEstimationsService.getMetricsByExplanation(false);
        break;
      default:
        this.isLoadingMetrics = false;
        return;
    }

    request$.subscribe({
      next: (res) => {
        this.metricsResult = res;
        this.isLoadingMetrics = false;
      },
      error: (err) => {
        this.metricsError = 'Failed to load metrics data.';
        console.error('Metrics error', err);
        this.isLoadingMetrics = false;
      }
    });
  }

  // ----- Chart helpers -----
  private asArray(): any[] {
    if (Array.isArray(this.metricsResult)) {
      return this.metricsResult;
    }
    return [];
  }

  private mapProviderComparison(metrics: any[]): { labels: string[]; values: number[] } | null {
    if (!metrics.length) return null;
    const grouped: Record<string, number[]> = {};
    metrics.forEach((m) => {
      const provider = m.aiProvider || m.provider;
      const hours = m.estimatedResolutionHours ?? m.estimatedHours;
      if (!provider || hours == null) return;
      grouped[provider] = grouped[provider] || [];
      grouped[provider].push(hours);
    });
    const labels = Object.keys(grouped);
    if (!labels.length) return null;
    const values = labels.map((key) => {
      const arr = grouped[key];
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    });
    return { labels, values };
  }

  private mapMarkdownToPie(metrics: any[]): { labels: string[]; values: number[] } | null {
    if (!metrics.length) return null;
    let on = 0;
    let off = 0;
    metrics.forEach((m) => {
      if (m.markdownEnabled === true) on++;
      else if (m.markdownEnabled === false) off++;
    });
    if (!on && !off) return null;
    return {
      labels: ['Markdown ON', 'Markdown OFF'],
      values: [on, off]
    };
  }

  // Data for HTML/CSS charts
  get providerComparison(): { label: string; value: number; cssClass: string }[] {
    const data = this.mapProviderComparison(this.asArray());
    if (!data) return [];
    // Update chart data for Chart.js
    this.providerBarData.labels = data.labels;
    this.providerBarData.datasets[0].data = data.values;
    const palette = ['bar-green', 'bar-blue', 'bar-purple', 'bar-orange'];
    return data.labels.map((label, index) => ({
      label,
      value: data.values[index] ?? 0,
      cssClass: palette[index % palette.length]
    }));
  }

  get maxProviderValue(): number {
    return this.providerComparison.reduce((max, p) => (p.value > max ? p.value : max), 0) || 0;
  }

  get markdownDistribution(): { label: string; value: number }[] {
    const data = this.mapMarkdownToPie(this.asArray());
    if (!data) return [];
    // Update chart data for Chart.js
    this.markdownPieData.labels = data.labels;
    this.markdownPieData.datasets[0].data = data.values;
    return data.labels.map((label, index) => ({ label, value: data.values[index] ?? 0 }));
  }

  get totalMarkdownRuns(): number {
    return this.markdownDistribution.reduce((sum, m) => sum + m.value, 0) || 0;
  }

  get markdownOnPercent(): number {
    if (!this.totalMarkdownRuns) return 0;
    const on = this.markdownDistribution.find((m) => m.label === 'Markdown ON')?.value ?? 0;
    return (on / this.totalMarkdownRuns) * 100;
  }

  get markdownOffPercent(): number {
    if (!this.totalMarkdownRuns) return 0;
    const off = this.markdownDistribution.find((m) => m.label === 'Markdown OFF')?.value ?? 0;
    return (off / this.totalMarkdownRuns) * 100;
  }
}
