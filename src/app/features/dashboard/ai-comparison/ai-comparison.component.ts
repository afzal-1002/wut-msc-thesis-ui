import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { AiEstimationsService } from '../../../services/ai/ai-estimations.service';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, ChartOptions, ChartType } from 'chart.js';
import { AiOverallComparisonComponent } from './overall-comparison/ai-overall-comparison.component';

if (typeof window !== 'undefined') {
  Chart.register(ChartDataLabels);
}

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

@Component({
  selector: 'app-ai-comparison',
  standalone: true,
  imports: [CommonModule, NgChartsModule, AiOverallComparisonComponent],
  templateUrl: './ai-comparison.component.html',
  styleUrls: ['./ai-comparison.component.css']
})
export class AiComparisonComponent {
    goBack(): void {
      this.router.navigate(['../']);
    }

      contentBarPairs: { name: string; value: number }[] = [];
  contentYAxisTicks: number[] = [0, 0.5, 1, 1.5, 2, 2.5, 3];
  fullComparisonMetrics: any[] = [];
  maxResponseTimeStat = 1;

  summaryBarData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Summary categories won',
        backgroundColor: ['#66bb6a', '#42a5f5'],
        borderColor: ['#2e7d32', '#1e88e5'],
        borderWidth: 1.5,
        borderRadius: 6,
        maxBarThickness: 32
      }
    ]
  };
  summaryBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#111827',
        font: { weight: 'bold', size: 13 },
        formatter: (value: any) => (typeof value === 'number' ? value.toFixed(0) : value)
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        type: 'linear',
        beginAtZero: true,
        grid: { color: '#e5e7eb' }
      }
    }
  };
  summaryBarType: 'bar' = 'bar';

  stabilityBarData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Avg std dev (h)',
        backgroundColor: ['#60a5fa', '#f59e0b'],
        borderColor: ['#2563eb', '#b45309'],
        borderWidth: 1.5,
        borderRadius: 0,
        maxBarThickness: 28
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
      y: { type: 'linear', beginAtZero: true, grid: { color: '#eee' } }
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
        backgroundColor: ['#60a5fa', '#f59e0b'],
        borderColor: ['#2563eb', '#b45309'],
        borderWidth: 1.5,
        borderRadius: 0,
        maxBarThickness: 28
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
      y: { type: 'linear', beginAtZero: true, grid: { color: '#eee' } }
    }
  };
  estimationBarType: 'bar' = 'bar';

  performanceBarData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Avg response time (s)',
        backgroundColor: ['#60a5fa', '#f59e0b'],
        borderColor: ['#2563eb', '#b45309'],
        borderWidth: 1.5,
        borderRadius: 0,
        maxBarThickness: 28
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
      y: { type: 'linear', beginAtZero: true, grid: { color: '#eee' } }
    }
  };
  performanceBarType: 'bar' = 'bar';

  // Content quality: Engineering Score bar chart
  contentBarChartData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Engineering Score',
        backgroundColor: ['#66bb6a', '#42a5f5'],
        borderColor: ['#2e7d32', '#1e88e5'],
        borderWidth: 1.5,
        borderRadius: 0,
        maxBarThickness: 40
      }
    ]
  };
  contentBarChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#111827',
        font: { weight: 'bold', size: 13 },
        formatter: (value: any) =>
          typeof value === 'number' ? value.toFixed(2) : value
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        type: 'linear',
        beginAtZero: true,
        max: 3,
        ticks: { stepSize: 1 },
        grid: { color: '#e5e7eb' }
      }
    }
  };
  contentBarChartType: 'bar' = 'bar';

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
      y: { type: 'linear', beginAtZero: true, grid: { color: '#eee' } }
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
  activeTab: 'overall' | 'performance' | 'estimation' | 'stability' | 'content' | 'summary' = 'overall';
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
    this.selectTab('overall');
  }

  selectTab(tab: 'overall' | 'performance' | 'estimation' | 'stability' | 'content' | 'summary'): void {
    this.activeTab = tab;
    switch (tab) {
      case 'overall':
        return;
      case 'performance':
        this.aiService.getFullModelComparison().subscribe(raw => {
          this.fullComparisonMetrics = raw ?? [];
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
                type: 'linear',
                beginAtZero: true,
                grid: { color: '#eee' },
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
                type: 'linear',
                beginAtZero: true,
                grid: { color: '#eee' },
                max: perfAvgMax
              }
            }
          };

          this.prepareAllCharts();
          this.updateMaxResponseTimeStat();
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
                type: 'linear',
                beginAtZero: true,
                grid: { color: '#eee' },
                max: stabilityMax
              }
            }
          };
          this.prepareAllCharts();
        });
        break;
      case 'content':
        this.aiService.getContentQualityComparison().subscribe(raw => {
          const gem = Number(raw['GEMINI'] ?? raw['Gemini'] ?? 0);
          const deep = Number(raw['DEEPSEEK'] ?? raw['DeepSeek'] ?? 0);

          this.contentMetrics = [
            { label: 'Engineering Score', gemini: gem, deepSeek: deep }
          ];

          this.updateContentChart(gem, deep);
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
        display: true,
        align: 'top',
        anchor: 'end',
        color: '#111827',
        font: { weight: 'bold', size: 12 },
        formatter: (value: unknown) =>
          typeof value === 'number' ? value.toFixed(2) : value
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { type: 'linear', beginAtZero: true, grid: { color: '#eee' } }
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

    if (this.fullComparisonMetrics.length) {
      const metrics = ['Avg', 'Min', 'Max', 'Std Dev'];
      const normalizeData = (model?: any) => [
        Number(model?.avgResponseTimeSec ?? 0),
        Number(model?.minResponseTimeSec ?? 0),
        Number(model?.maxResponseTimeSec ?? 0),
        Number(model?.stdDeviationResponseTime ?? 0)
      ];
      const gemini = this.fullComparisonMetrics.find(m => (m.aiProvider ?? '').toUpperCase() === 'GEMINI');
      const deepseek = this.fullComparisonMetrics.find(m => (m.aiProvider ?? '').toUpperCase() === 'DEEPSEEK');
      this.stabilityRadarData = {
        labels: metrics,
        datasets: [
          {
            label: 'Gemini',
            data: normalizeData(gemini),
            backgroundColor: 'rgba(37,99,235,0.15)',
            borderColor: '#1d4ed8',
            pointBackgroundColor: '#1d4ed8'
          },
          {
            label: 'DeepSeek',
            data: normalizeData(deepseek),
            backgroundColor: 'rgba(34,197,94,0.15)',
            borderColor: '#16a34a',
            pointBackgroundColor: '#16a34a'
          }
        ]
      };
    }

    const summaryScores = this.summaryScores;
    if (summaryScores.length) {
      const labels = summaryScores.map(s => s.name);
      const values = summaryScores.map(s => s.value);
      this.summaryPieData = {
        labels,
        datasets: [{ data: values, backgroundColor: ['#1976d2', '#43a047'] }]
      };
      this.summaryBarData.labels = labels;
      this.summaryBarData.datasets[0].data = values;
      const summaryMax = this.computeYAxisMax(values);
      this.summaryBarOptions = {
        ...this.summaryBarOptions,
        scales: {
          ...this.summaryBarOptions.scales,
          y: {
            type: 'linear',
            beginAtZero: true,
            grid: { color: '#e5e7eb' },
            max: summaryMax
          }
        }
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
    this.fetchResponseTimeStats();
  }

  private ensureResponseTimeStatsLoaded(): void {
    if (this.responseTimeStats || this.isLoadingResponseTime) return;
    this.fetchResponseTimeStats();
  }

  private fetchResponseTimeStats(): void {
    this.isLoadingResponseTime = true;
    this.responseTimeError = '';
    this.aiService.getResponseTimeStats().subscribe({
      next: raw => {
        this.responseTimeStats = raw;
        this.isLoadingResponseTime = false;
        this.prepareAllCharts();
        this.updateMaxResponseTimeStat();
      },
      error: err => {
        console.error('Response-time stats load error', err);
        this.responseTimeError = 'Failed to load response-time statistics.';
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
  get maxSummaryValue(): number {
    return this.summaryScores.reduce((m, p) => (p.value > m ? p.value : m), 0) || 0;
  }
  get maxStabilityBarValue(): number {
    return this.stabilityBarPairs.reduce((m, p) => (p.value > m ? p.value : m), 0) || 0;
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

  private updateContentChart(gem: number, deep: number): void {
    const labels = ['Gemini', 'DeepSeek'];
    const baseDataset = this.contentBarChartData.datasets?.[0] ?? {
      label: 'Engineering Score',
      backgroundColor: ['#66bb6a', '#42a5f5'],
      borderColor: ['#2e7d32', '#1e88e5'],
      borderWidth: 1.5,
      borderRadius: 0,
      maxBarThickness: 40
    };
    this.contentBarChartData = {
      labels,
      datasets: [{ ...baseDataset, data: [gem, deep] }]
    };

    const dynamicMax = Math.max(3, this.computeYAxisMax([gem, deep]));
    this.contentBarChartOptions = {
      ...this.contentBarChartOptions,
      scales: {
        ...this.contentBarChartOptions.scales,
        y: {
          type: 'linear',
          beginAtZero: true,
          max: dynamicMax,
          ticks: { stepSize: 1 },
          grid: { color: '#e5e7eb' }
        }
      }
    };
  }

  private updateMaxResponseTimeStat(): void {
    const values: number[] = [];
    this.fullComparisonMetrics.forEach(model => {
      values.push(
        Number(model?.minResponseTimeSec ?? 0),
        Number(model?.avgResponseTimeSec ?? 0),
        Number(model?.maxResponseTimeSec ?? 0),
        Number(model?.stdDeviationResponseTime ?? 0)
      );
    });
    if (Array.isArray(this.responseTimeStats)) {
      this.responseTimeStats.forEach(stat => {
        values.push(
          Number(stat?.minResponseTimeSec ?? 0),
          Number(stat?.avgResponseTimeSec ?? 0),
          Number(stat?.maxResponseTimeSec ?? 0),
          Number(stat?.stdDeviationSec ?? stat?.stdDeviationResponseTime ?? 0)
        );
      });
    }
    const finite = values.filter(v => Number.isFinite(v) && v > 0);
    this.maxResponseTimeStat = finite.length ? Math.max(...finite) : 1;
  }
}
