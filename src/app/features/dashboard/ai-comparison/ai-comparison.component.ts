import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { AiEstimationsService } from '../../../services/ai/ai-estimations.service';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

interface ModelMetricPoint {
  name: string;
  value: number;
}
interface StabilityPoint {
  run: number;
  stdDevGemini: number;
  stdDevDeepSeek: number;
}
interface ContentMetric {
  label: string;
  gemini: number;
  deepSeek: number;
}
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-ai-comparison',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './ai-comparison.component.html',
  styleUrls: ['./ai-comparison.component.css']
})
export class AiComparisonComponent {
    goBack(): void {
      this.router.navigate(['../']);
    }

  // Fix: Add maxResponseTimeStat for template usage
  maxResponseTimeStat: number = 1; // TODO: Set this dynamically if needed
  // Chart.js Bar chart configs
  stabilityBarData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Avg std dev (h)',
        backgroundColor: ['#1976d2', '#43a047'],
        borderRadius: 8,
        maxBarThickness: 40
      }
    ]
  };
  stabilityBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#222',
        font: { weight: 'bold', size: 13 },
        formatter: (value: any) => typeof value === 'number' ? value.toFixed(2) + ' h' : value
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#eee' } }
    }
  };
  // Fix: Use string literal types for chart types
  stabilityBarType: 'bar' = 'bar';

  estimationBarData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Avg estimated hours',
        backgroundColor: ['#1976d2', '#43a047'],
        borderRadius: 8,
        maxBarThickness: 40
      }
    ]
  };
  estimationBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#222',
        font: { weight: 'bold', size: 13 },
        formatter: (value: any) => typeof value === 'number' ? value.toFixed(2) : value
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#eee' } }
    }
  };
  estimationBarType: 'bar' = 'bar';

  performanceBarData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Avg response time (s)',
        backgroundColor: ['#1976d2', '#43a047'],
        borderRadius: 8,
        maxBarThickness: 40
      }
    ]
  };
  performanceBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#222',
        font: { weight: 'bold', size: 13 },
        formatter: (value: any) => typeof value === 'number' ? value.toFixed(2) : value
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#eee' } }
    }
  };
  performanceBarType: 'bar' = 'bar';

  // Detailed performance distribution (min / avg / max / std dev) per model
  performanceDetailBarData: any = null;
  performanceDetailBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#222',
        font: { weight: 'bold', size: 11 },
        formatter: (value: any) => {
          const num = typeof value === 'number' ? value : Number(value);
          return Number.isFinite(num) ? num.toFixed(2) : value;
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#eee' } }
    }
  };
  performanceDetailBarType: 'bar' = 'bar';

  // Model data arrays
  performanceModels: ModelMetricPoint[] = [];
  estimationModels: ModelMetricPoint[] = [];
  stabilitySeries: StabilityPoint[] = [];
  contentMetrics: ContentMetric[] = [];
  comparisonSummary: any = null;

  // UI state
  activeTab: 'performance' | 'estimation' | 'stability' | 'content' | 'summary' = 'performance';
  responseTimeStats: any = null;
  responseTimeSummary: any = null;
  activeResponseView: 'stats' | 'summary' | null = null;
  isLoadingResponseTime = false;
  responseTimeError = '';
  isLoadingPerformance = false;
  isLoadingEstimation = false;
  isLoadingStability = false;
  isLoadingContent = false;
  isLoadingSummary = false;
  errorPerformance = '';
  errorEstimation = '';
  errorStability = '';
  errorContent = '';
  errorSummary = '';

  constructor(private aiService: AiEstimationsService, private router: Router) {}

  ngOnInit(): void {
    this.selectTab('performance');
  }

  selectTab(tab: 'performance' | 'estimation' | 'stability' | 'content' | 'summary'): void {
    this.activeTab = tab;
    switch (tab) {
      case 'performance':
        this.aiService.getFullModelComparison().subscribe(raw => {
          // Bar chart: Avg response time (seconds)
          this.performanceBarData.labels = raw.map((m: any) => m.aiProvider);
          const avgValues = raw.map((m: any) => Number(m.avgResponseTimeSec ?? 0));
          this.performanceBarData.datasets[0].data = avgValues;

          // Save mapped models for other charts
          this.performanceModels = this.mapPerformance(raw);

          // Detailed distribution chart: min / avg / max / std dev per model
          const labels = raw.map((m: any) => this.normalizeModelName(m.aiProvider));
          const mins = raw.map((m: any) => Number(m.minResponseTimeSec ?? 0));
          const avgs = raw.map((m: any) => Number(m.avgResponseTimeSec ?? 0));
          const maxs = raw.map((m: any) => Number(m.maxResponseTimeSec ?? 0));
          const stds = raw.map((m: any) => Number(m.stdDeviationResponseTime ?? 0));

          this.performanceDetailBarData = {
            labels,
            datasets: [
              {
                label: 'Min (s)',
                data: mins,
                backgroundColor: '#16a34a',
                borderColor: '#166534',
                borderWidth: 1.5,
                borderRadius: 8,
                maxBarThickness: 36
              },
              {
                label: 'Avg (s)',
                data: avgs,
                backgroundColor: '#2563eb',
                borderColor: '#1d4ed8',
                borderWidth: 1.5,
                borderRadius: 8,
                maxBarThickness: 36
              },
              {
                label: 'Max (s)',
                data: maxs,
                backgroundColor: '#dc2626',
                borderColor: '#b91c1c',
                borderWidth: 1.5,
                borderRadius: 8,
                maxBarThickness: 36
              },
              {
                label: 'Std dev (s)',
                data: stds,
                backgroundColor: '#f59e0b',
                borderColor: '#b45309',
                borderWidth: 1.5,
                borderRadius: 8,
                maxBarThickness: 36
              }
            ]
          };

          // Apply dynamic Y-axis max with two extra units beyond tallest bar
          const perfValues: number[] = [...mins, ...avgs, ...maxs, ...stds];
          const perfMax = this.computeYAxisMax(perfValues);
          this.performanceDetailBarOptions = {
            ...this.performanceDetailBarOptions,
            scales: {
              ...this.performanceDetailBarOptions.scales,
              y: {
                ...((this.performanceDetailBarOptions.scales && this.performanceDetailBarOptions.scales['y']) || {}),
                max: perfMax
              }
            }
          };

          // Line chart: Response time trend (min, avg, max)
          this.performanceLineData = {
            labels: ['Min', 'Avg', 'Max'],
            datasets: raw.map((m: any) => ({
              label: m.aiProvider,
              data: [m.minResponseTimeSec, m.avgResponseTimeSec, m.maxResponseTimeSec],
              borderColor: m.aiProvider === 'GEMINI' ? '#1d4ed8' : '#16a34a',
              backgroundColor: 'transparent',
              fill: false,
              tension: 0.3
            }))
          };
          // Also adjust main performance bar chart Y-axis
          const perfAvgMax = this.computeYAxisMax(avgValues);
          this.performanceBarOptions = {
            ...this.performanceBarOptions,
            scales: {
              ...this.performanceBarOptions.scales,
              y: {
                ...((this.performanceBarOptions.scales && this.performanceBarOptions.scales['y']) || {}),
                max: perfAvgMax
              }
            }
          };

          this.prepareAllCharts();
        });
        break;
      case 'estimation':
        this.aiService.getEstimationComparison().subscribe(raw => {
          this.estimationBarData.labels = Object.keys(raw);
          this.estimationBarData.datasets[0].data = Object.values(raw);
          this.prepareAllCharts();
        });
        break;
      case 'stability':
        this.aiService.getStabilityComparison().subscribe(raw => {
          // Use a grouped bar chart for stability
          this.stabilityBarData.labels = Object.keys(raw);
          this.stabilityBarData.datasets[0].data = Object.values(raw);
          // Dynamic Y-axis max with two extra units beyond tallest bar
          const stabilityValues = Object.values(raw) as number[];
          const stabilityMax = this.computeYAxisMax(stabilityValues);
          this.stabilityBarOptions = {
            ...this.stabilityBarOptions,
            scales: {
              ...this.stabilityBarOptions.scales,
              y: {
                ...((this.stabilityBarOptions.scales && this.stabilityBarOptions.scales['y']) || {}),
                max: stabilityMax
              }
            }
          };
          this.prepareAllCharts();
        });
        break;
      case 'content':
        this.aiService.getContentQualityComparison().subscribe(raw => {
          this.contentMetrics = [
            { label: 'Engineering Score', gemini: raw['GEMINI'], deepSeek: raw['DEEPSEEK'] }
          ];
          // Pie chart for content
          this.summaryPieData = {
            labels: Object.keys(raw),
            datasets: [{ data: Object.values(raw), backgroundColor: ['#1976d2', '#43a047'] }]
          };
          this.prepareAllCharts();
        });
        break;
      case 'summary':
        this.loadSummary();
        break;
    }
  }

  // Line chart for response time trends
  performanceLineData: any = null;
  performanceLineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: false },
      datalabels: {
        display: false
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#eee' } }
    }
  };
  performanceLineType: 'line' = 'line';

  // Radar chart for multi-metric comparison
  stabilityRadarData: any = null;
  stabilityRadarOptions: ChartOptions<'radar'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: false },
      datalabels: { display: false }
    }
  };
  stabilityRadarType: 'radar' = 'radar';

  // Pie chart for summary breakdown
  summaryPieData: any = null;
  summaryPieOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: false },
      datalabels: {
        color: '#222',
        font: { weight: 'bold', size: 13 },
        formatter: (value: any) => value
      }
    }
  };
  summaryPieType: 'pie' = 'pie';

  // Prepare all extra chart data after API loads
  prepareAllCharts(): void {
    // Line chart: Response time trends (dummy data, replace with real if available)
    if (this.performanceModels.length) {
      this.performanceLineData = {
        labels: this.performanceModels.map(m => m.name),
        datasets: [
          {
            label: 'Avg Response Time',
            data: this.performanceModels.map(m => m.value),
            borderColor: '#1d4ed8',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.3
          }
        ]
      };
    }

    // Radar chart: Multi-metric comparison (dummy, replace with real if available)
    if (this.responseTimeStats && Array.isArray(this.responseTimeStats)) {
      const metrics = ['Avg', 'Min', 'Max', 'StdDev'];
      const gemini = this.responseTimeStats.find((s: any) => s.aiProvider?.toLowerCase().includes('gemini'));
      const deepseek = this.responseTimeStats.find((s: any) => s.aiProvider?.toLowerCase().includes('deepseek'));
      this.stabilityRadarData = {
        labels: metrics,
        datasets: [
          {
            label: 'Gemini',
            data: gemini ? [gemini.avgResponseTimeSec, gemini.minResponseTimeSec, gemini.maxResponseTimeSec, gemini.stdDeviationSec] : [0,0,0,0],
            backgroundColor: 'rgba(37,99,235,0.15)',
            borderColor: '#1d4ed8',
            pointBackgroundColor: '#1d4ed8'
          },
          {
            label: 'DeepSeek',
            data: deepseek ? [deepseek.avgResponseTimeSec, deepseek.minResponseTimeSec, deepseek.maxResponseTimeSec, deepseek.stdDeviationSec] : [0,0,0,0],
            backgroundColor: 'rgba(34,197,94,0.15)',
            borderColor: '#16a34a',
            pointBackgroundColor: '#16a34a'
          }
        ]
      };
    }

    // Pie chart: Summary breakdown
    if (this.summaryScores && this.summaryScores.length) {
      this.summaryPieData = {
        labels: this.summaryScores.map(s => s.name),
        datasets: [
          {
            data: this.summaryScores.map(s => s.value),
            backgroundColor: ['#1976d2', '#43a047']
          }
        ]
      };
    }
  }

  private loadSummary(): void {
    if (this.comparisonSummary || this.errorSummary) return;
    this.isLoadingSummary = true;
    this.errorSummary = '';
    this.aiService.getComparisonSummary().subscribe({
      next: raw => {
        this.comparisonSummary = raw;
        this.isLoadingSummary = false;
        this.prepareAllCharts();
      },
      error: err => {
        console.error('Comparison summary load error', err);
        this.errorSummary = 'Failed to load comparison summary.';
        this.isLoadingSummary = false;
      }
    });
  }

  // Response time stats
  loadResponseTimeStats(): void {
    this.activeResponseView = 'stats';
    if (this.responseTimeStats && !this.responseTimeError) return;
    this.isLoadingResponseTime = true;
    this.responseTimeError = '';
    this.aiService.getResponseTimeStats().subscribe({
      next: raw => {
        this.responseTimeStats = raw;
        this.isLoadingResponseTime = false;
        this.prepareAllCharts();
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
    if (this.responseTimeSummary && !this.responseTimeError) return;
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

  // Data mapping helpers
  private mapPerformance(raw: any): ModelMetricPoint[] {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((m: any) => ({
        name: this.normalizeModelName(m.aiProvider ?? m.name),
        value: Number(m.avgResponseTimeSec ?? m.avgResponseTimeSeconds ?? 0)
      }));
    }
    if (raw && typeof raw === 'object') {
      return Object.entries(raw).map(([key, value]) => ({
        name: this.normalizeModelName(key),
        value: Number(value as number)
      }));
    }
    return [];
  }

  private mapEstimation(raw: any): ModelMetricPoint[] {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((m: any) => ({
        name: this.normalizeModelName(m.aiProvider ?? m.name),
        value: Number(m.avgEstimatedHours ?? 0)
      }));
    }
    if (raw && typeof raw === 'object') {
      return Object.entries(raw).map(([key, value]) => ({
        name: this.normalizeModelName(key),
        value: Number(value as number)
      }));
    }
    return [];
  }

  private mapStability(raw: any): StabilityPoint[] {
    if (!raw) return [];
    if (Array.isArray(raw.runs)) {
      return raw.runs.map((r: any) => ({
        run: Number(r.run ?? 0),
        stdDevGemini: Number(r.stdDevGemini ?? 0),
        stdDevDeepSeek: Number(r.stdDevDeepSeek ?? 0)
      }));
    }
    if (raw && typeof raw === 'object') {
      const gem = Number(raw['GEMINI'] ?? raw['Gemini'] ?? 0);
      const deep = Number(raw['DEEPSEEK'] ?? raw['DeepSeek'] ?? 0);
      return [{ run: 1, stdDevGemini: gem, stdDevDeepSeek: deep }];
    }
    return [];
  }

  private mapContent(raw: any): ContentMetric[] {
    if (!raw) return [];
    if (Array.isArray(raw.metrics)) {
      const metrics: string[] = raw.metrics;
      const gemValues: number[] = raw.gemini?.values ?? [];
      const deepValues: number[] = raw.deepSeek?.values ?? [];
      return metrics.map((label, idx) => ({
        label,
        gemini: gemValues[idx] ?? 0,
        deepSeek: deepValues[idx] ?? 0
      }));
    }
    if (raw && typeof raw === 'object') {
      const gem = Number(raw['GEMINI'] ?? raw['Gemini'] ?? 0);
      const deep = Number(raw['DEEPSEEK'] ?? raw['DeepSeek'] ?? 0);
      return [{ label: 'Engineering relevance score', gemini: gem, deepSeek: deep }];
    }
    return [];
  }

  // Helpers for chart scaling and data
  get maxPerformanceValue(): number {
    return this.performanceModels.reduce((m, p) => (p.value > m ? p.value : m), 0) || 0;
  }
  get maxEstimationValue(): number {
    return this.estimationModels.reduce((m, p) => (p.value > m ? p.value : m), 0) || 0;
  }
  get maxStabilityValue(): number {
    return this.stabilitySeries.reduce((m, p) => Math.max(m, p.stdDevGemini, p.stdDevDeepSeek), 0) || 0;
  }
  get maxContentValue(): number {
    return this.contentMetrics.reduce((m, c) => Math.max(m, c.gemini, c.deepSeek), 0) || 0;
  }
  get maxSummaryValue(): number {
    return this.summaryScores.reduce((m, p) => (p.value > m ? p.value : m), 0) || 0;
  }
  get maxStabilityBarValue(): number {
    return this.stabilityBarPairs.reduce((m, p) => (p.value > m ? p.value : m), 0) || 0;
  }
  get contentBarPairs(): ModelMetricPoint[] {
    if (!this.contentMetrics.length) return [];
    const metric = this.contentMetrics[0];
    return [
      { name: 'Gemini', value: metric.gemini },
      { name: 'DeepSeek', value: metric.deepSeek }
    ];
  }
  get stabilityBarPairs(): ModelMetricPoint[] {
    if (!this.stabilitySeries.length) return [];
    let totalGemini = 0, totalDeepSeek = 0;
    for (const p of this.stabilitySeries) {
      totalGemini += p.stdDevGemini;
      totalDeepSeek += p.stdDevDeepSeek;
    }
    const count = this.stabilitySeries.length || 1;
    return [
      { name: 'Gemini', value: totalGemini / count },
      { name: 'DeepSeek', value: totalDeepSeek / count }
    ];
  }
  get summaryScores(): ModelMetricPoint[] {
    if (!this.comparisonSummary) return [];
    const counts: Record<string, number> = { Gemini: 0, DeepSeek: 0 };
    const summary = this.comparisonSummary as Record<string, unknown>;
    for (const key of Object.keys(summary)) {
      const rawValue = summary[key];
      if (rawValue == null) continue;
      const value = String(rawValue).toUpperCase();
      if (value.includes('GEMINI')) counts['Gemini'] += 1;
      if (value.includes('DEEPSEEK')) counts['DeepSeek'] += 1;
    }
    return [
      { name: 'Gemini', value: counts['Gemini'] },
      { name: 'DeepSeek', value: counts['DeepSeek'] }
    ];
  }
  get summaryKeyValues(): { label: string; value: string }[] {
    if (!this.comparisonSummary) return [];
    const summary = this.comparisonSummary as Record<string, unknown>;
    return Object.keys(summary).map(key => ({
      label: this.humanizeSummaryKey(key),
      value: String(summary[key] ?? '')
    }));
  }

  // Utility
  private normalizeModelName(name: string): string {
    if (!name) return '';
    const n = name.toLowerCase();
    if (n.includes('gemini')) return 'Gemini';
    if (n.includes('deepseek')) return 'DeepSeek';
    return name;
  }
  private humanizeSummaryKey(key: string): string {
    const known: Record<string, string> = {
      bestForSpeed: 'Best for speed',
      bestForEngineeringDepth: 'Best for engineering depth',
      recommendedForResearch: 'Recommended for research',
      recommendedForIndustry: 'Recommended for industry',
      bestForStability: 'Best for stability'
    };
    if (known[key]) return known[key];
    const withSpaces = key.replace(/([a-z])([A-Z])/g, '$1 $2');
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  }

  // Utility: compute a nice Y-axis max with two extra units above the highest value
  private computeYAxisMax(values: number[]): number {
    if (!values || !values.length) {
      return 1;
    }
    const finiteVals = values.filter(v => Number.isFinite(v));
    if (!finiteVals.length) {
      return 1;
    }
    const rawMax = Math.max(...finiteVals, 0);
    if (rawMax <= 0) {
      return 2;
    }
    const ceil = Math.ceil(rawMax);
    const even = ceil % 2 === 0 ? ceil : ceil + 1;
    return even + 2;
  }
}
