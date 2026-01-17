
import { Component } from '@angular/core';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { AiEstimationsService } from '../../../services/ai/ai-estimations.service';

Chart.register(ChartDataLabels);
@Component({
  selector: 'app-ai-response-timing',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './ai-response-timing.component.html',
  styleUrls: ['./ai-response-timing.component.css']
})
export class AiResponseTimingComponent {
  responseTimeStats: any = null;
  responseTimeSummary: any = null;
  activeResponseView: 'stats' | 'summary' | null = null;
  isLoadingResponseTime = false;
  responseTimeError = '';

  // Chart.js bar chart config for avg response time
  barChartData: { labels: string[]; datasets: Array<any> } = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Avg Response Time (s)',
        backgroundColor: '#1976d2',
        borderRadius: 8,
        maxBarThickness: 40
      }
    ]
  };
  barChartOptions = {
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
  barChartType = 'bar';

  // Grouped bar chart for min/max/stddev (box plot alternative)
  boxChartData: { labels: string[]; datasets: Array<any> } = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Min',
        backgroundColor: '#43a047',
        borderRadius: 8,
        maxBarThickness: 30
      },
      {
        data: [],
        label: 'Max',
        backgroundColor: '#e53935',
        borderRadius: 8,
        maxBarThickness: 30
      },
      {
        data: [],
        label: 'StdDev',
        backgroundColor: '#fbc02d',
        borderRadius: 8,
        maxBarThickness: 30
      }
    ]
  };
  boxChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
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
  boxChartType = 'bar';

  // Radar chart for multi-metric comparison
  radarChartData: { labels: string[]; datasets: Array<any> } = {
    labels: ['Avg', 'Min', 'Max', 'StdDev'],
    datasets: []
  };
  radarChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: false },
      datalabels: {
        color: '#222',
        font: { weight: 'bold' as const, size: 13 },
        formatter: function(value: any) {
          if (typeof value === 'number') {
            return value.toFixed(2);
          }
          return value;
        }
      }
    }
  };
  radarChartType = 'radar';

  // Line chart placeholder (requires time series data)
  lineChartData: { labels: string[]; datasets: Array<any> } = {
    labels: [],
    datasets: []
  };
  lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: false }
    }
  };
  lineChartType = 'line';

  constructor(private aiService: AiEstimationsService) {}

  setActiveResponseView(view: 'stats' | 'summary'): void {
    if (this.activeResponseView === view) return;
    this.activeResponseView = view;
    if (view === 'stats') {
      this.loadResponseTimeStats();
    } else if (view === 'summary') {
      this.loadResponseTimeSummary();
    }
  }

  loadResponseTimeStats(): void {
    this.activeResponseView = 'stats';
    if (this.responseTimeStats && !this.responseTimeError) {
      return;
    }
    this.isLoadingResponseTime = true;
    this.responseTimeError = '';
    this.aiService.getResponseTimeStats().subscribe({
      next: raw => {
        this.responseTimeStats = raw;
        // Update bar chart data
        this.barChartData.labels = raw.map((stat: any) => stat.aiProvider);
        this.barChartData.datasets[0].data = raw.map((stat: any) => stat.avgResponseTimeSec);
        // Update box plot (grouped bar) data
        this.boxChartData.labels = raw.map((stat: any) => stat.aiProvider);
        this.boxChartData.datasets[0].data = raw.map((stat: any) => stat.minResponseTimeSec);
        this.boxChartData.datasets[1].data = raw.map((stat: any) => stat.maxResponseTimeSec);
        this.boxChartData.datasets[2].data = raw.map((stat: any) => stat.stdDeviationSec);
        // Radar chart: one dataset per model
        this.radarChartData.datasets = raw.map((stat: any, idx: number) => ({
          label: stat.aiProvider,
          data: [stat.avgResponseTimeSec, stat.minResponseTimeSec, stat.maxResponseTimeSec, stat.stdDeviationSec],
          fill: true,
          backgroundColor: `rgba(${60+idx*80},${120+idx*40},229,0.18)`,
          borderColor: `rgba(${60+idx*80},${120+idx*40},229,0.8)`
        }));
        // Line chart: placeholder (requires time series data)
        this.lineChartData.labels = [];
        this.lineChartData.datasets = [];
        this.isLoadingResponseTime = false;
      },
      error: err => {
        console.error('Response-time stats load error', err);
        this.responseTimeError = 'Failed to load response-time statistics.';
        this.isLoadingResponseTime = false;
      }
    });
  }

  loadResponseTimeSummary(): void {
    this.activeResponseView = 'summary';
    if (this.responseTimeSummary && !this.responseTimeError) {
      return;
    }
    this.isLoadingResponseTime = true;
    this.responseTimeError = '';
    this.aiService.getResponseTimeSummary().subscribe({
      next: raw => {
        this.responseTimeSummary = raw;
        this.isLoadingResponseTime = false;
      },
      error: err => {
        console.error('Response-time summary load error', err);
        this.responseTimeError = 'Failed to load fastest vs slowest summary.';
        this.isLoadingResponseTime = false;
      }
    });
  }

  get maxResponseTimeStat(): number {
    if (!this.responseTimeStats || !Array.isArray(this.responseTimeStats)) {
      return 0;
    }
    let max = 0;
    for (const stat of this.responseTimeStats) {
      max = Math.max(
        max,
        stat.avgResponseTimeSec || 0,
        stat.minResponseTimeSec || 0,
        stat.maxResponseTimeSec || 0,
        stat.stdDeviationSec || 0
      );
    }
    return max;
  }
}
