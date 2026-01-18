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

  // Additional charts for metrics analysis
  responseTimeBarData: any = null;
  responseTimeBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#111',
        font: { weight: 'bold', size: 12 },
        formatter: (value: any) => (typeof value === 'number' ? value.toFixed(2) : value)
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#eee' } }
    }
  };
  responseTimeBarType: 'bar' = 'bar';

  estimationRangeBarData: any = null;
  estimationRangeBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#111',
        font: { weight: 'bold', size: 11 },
        formatter: (value: any) => (typeof value === 'number' ? value.toFixed(2) : value)
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#eee' } }
    }
  };
  estimationRangeBarType: 'bar' = 'bar';

  estimationTrendLineData: any = null;
  estimationTrendLineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#111',
        font: { weight: 'bold', size: 11 },
        formatter: (value: any) => (typeof value === 'number' ? value.toFixed(2) : value)
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#eee' } }
    }
  };
  estimationTrendLineType: 'line' = 'line';

  comparisonRadarData: any = null;
  comparisonRadarOptions: ChartOptions<'radar'> = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      datalabels: {
        color: '#111',
        font: { weight: 'bold', size: 11 },
        formatter: (value: any) => (typeof value === 'number' ? value.toFixed(2) : value)
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' },
        angleLines: { color: '#e5e7eb' },
        pointLabels: { color: '#374151', font: { size: 11 } }
      }
    }
  };
  comparisonRadarType: 'radar' = 'radar';

  // Box-plot style stability chart (min, Q1, median, Q3, max per model)
  stabilityBoxBarData: any = null;
  stabilityBoxBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#111',
        font: { weight: 'bold', size: 11 },
        formatter: (value: any) => (typeof value === 'number' ? value.toFixed(2) : value)
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#eee' } }
    }
  };
  stabilityBoxBarType: 'bar' = 'bar';
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
        this.prepareCharts();
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

  // Build additional Chart.js datasets from current metricsResult
  private prepareCharts(): void {
    const metrics = this.asArray();
    if (!metrics.length) {
      this.responseTimeBarData = null;
      this.estimationRangeBarData = null;
      this.estimationTrendLineData = null;
      this.comparisonRadarData = null;
      this.stabilityBoxBarData = null;
      return;
    }

    // Helper: group records by AI provider
    const byProvider: Record<string, any[]> = {};
    metrics.forEach(m => {
      const provider = m.aiProvider || m.provider;
      if (!provider) return;
      if (!byProvider[provider]) {
        byProvider[provider] = [];
      }
      byProvider[provider].push(m);
    });
    const providers = Object.keys(byProvider);
    if (!providers.length) {
      this.responseTimeBarData = null;
      this.estimationRangeBarData = null;
      this.estimationTrendLineData = null;
      this.comparisonRadarData = null;
      this.stabilityBoxBarData = null;
      return;
    }

    // 1) Bar chart – average response time per model
    const avgResponseTimes: number[] = providers.map(p => {
      const arr = byProvider[p];
      const secs = arr.map((m: any) => {
        const sec = m.analysisTimeSec != null
          ? Number(m.analysisTimeSec)
          : m.analysisTimeMs != null
            ? Number(m.analysisTimeMs) / 1000
            : 0;
        return isFinite(sec) ? sec : 0;
      });
      const sum = secs.reduce((a, b) => a + b, 0);
      return secs.length ? sum / secs.length : 0;
    });

    this.responseTimeBarData = {
      labels: providers,
      datasets: [
        {
          label: 'Avg response time (sec)',
          data: avgResponseTimes,
          backgroundColor: ['#60a5fa', '#22c55e', '#a78bfa', '#f97316'],
          borderRadius: 8,
          maxBarThickness: 40
        }
      ]
    };
    this.responseTimeBarOptions = {
      responsive: true,
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          max: this.computeYAxisMax(avgResponseTimes)
        }
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: '#222',
          font: { weight: 'bold', size: 12 },
          formatter: (value: any) => {
            const num = typeof value === 'number' ? value : Number(value);
            return Number.isFinite(num) ? num.toFixed(2) : value;
          }
        }
      }
    };

    // 2) Grouped bar chart – estimation distribution (min/avg/max hours) per model
    const mins: number[] = [];
    const avgs: number[] = [];
    const maxs: number[] = [];

    providers.forEach(p => {
      const hoursArr = byProvider[p]
        .map((m: any) => m.estimatedResolutionHours ?? m.estimatedHours)
        .filter((v: any) => v != null)
        .map((v: any) => Number(v));
      if (!hoursArr.length) {
        mins.push(0);
        avgs.push(0);
        maxs.push(0);
        return;
      }
      const min = Math.min(...hoursArr);
      const max = Math.max(...hoursArr);
      const avg = hoursArr.reduce((a: number, b: number) => a + b, 0) / hoursArr.length;
      mins.push(min);
      avgs.push(avg);
      maxs.push(max);
    });

    const rangeValues = [...mins, ...avgs, ...maxs];
    this.estimationRangeBarData = {
      labels: providers,
      datasets: [
        {
          label: 'Min hours',
          data: mins,
          backgroundColor: '#16a34a',
          borderColor: '#166534',
          borderWidth: 1.5,
          borderRadius: 8,
          maxBarThickness: 32
        },
        {
          label: 'Avg hours',
          data: avgs,
          backgroundColor: '#2563eb',
          borderColor: '#1d4ed8',
          borderWidth: 1.5,
          borderRadius: 8,
          maxBarThickness: 32
        },
        {
          label: 'Max hours',
          data: maxs,
          backgroundColor: '#dc2626',
          borderColor: '#b91c1c',
          borderWidth: 1.5,
          borderRadius: 8,
          maxBarThickness: 32
        }
      ]
    };
    this.estimationRangeBarOptions = {
      responsive: true,
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          max: this.computeYAxisMax(rangeValues)
        }
      },
      plugins: {
        legend: { display: true },
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
      }
    };

      // 2b) Box-plot-style grouped bar: min, Q1, median, Q3, max per model
      const q1s: number[] = [];
      const medians: number[] = [];
      const q3s: number[] = [];

      providers.forEach(p => {
        const hoursArr = byProvider[p]
          .map((m: any) => m.estimatedResolutionHours ?? m.estimatedHours)
          .filter((v: any) => v != null)
          .map((v: any) => Number(v))
          .sort((a: number, b: number) => a - b);
        if (!hoursArr.length) {
          q1s.push(0);
          medians.push(0);
          q3s.push(0);
          return;
        }
        const quantile = (arr: number[], p: number): number => {
          if (!arr.length) return 0;
          const pos = (arr.length - 1) * p;
          const base = Math.floor(pos);
          const rest = pos - base;
          if (arr[base + 1] !== undefined) {
            return arr[base] + rest * (arr[base + 1] - arr[base]);
          }
          return arr[base];
        };
        q1s.push(quantile(hoursArr, 0.25));
        medians.push(quantile(hoursArr, 0.5));
        q3s.push(quantile(hoursArr, 0.75));
      });

      const boxAllValues = [
        ...mins,
        ...q1s,
        ...medians,
        ...q3s,
        ...maxs
      ];

      this.stabilityBoxBarData = {
        labels: providers,
        datasets: [
          {
            label: 'Min hours',
            data: mins,
            backgroundColor: '#9ca3af',
            borderColor: '#4b5563',
            borderWidth: 1.5,
            borderRadius: 6,
            maxBarThickness: 28
          },
          {
            label: 'Q1 (25%)',
            data: q1s,
            backgroundColor: '#0ea5e9',
            borderColor: '#0369a1',
            borderWidth: 1.5,
            borderRadius: 6,
            maxBarThickness: 28
          },
          {
            label: 'Median (50%)',
            data: medians,
            backgroundColor: '#2563eb',
            borderColor: '#1d4ed8',
            borderWidth: 1.5,
            borderRadius: 6,
            maxBarThickness: 28
          },
          {
            label: 'Q3 (75%)',
            data: q3s,
            backgroundColor: '#3b82f6',
            borderColor: '#1d4ed8',
            borderWidth: 1.5,
            borderRadius: 6,
            maxBarThickness: 28
          },
          {
            label: 'Max hours',
            data: maxs,
            backgroundColor: '#dc2626',
            borderColor: '#b91c1c',
            borderWidth: 1.5,
            borderRadius: 6,
            maxBarThickness: 28
          }
        ]
      };
      this.stabilityBoxBarOptions = {
        responsive: true,
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            max: this.computeYAxisMax(boxAllValues)
          }
        },
        plugins: {
          legend: { display: true },
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: '#222',
            font: { weight: 'bold', size: 10 },
            formatter: (value: any) => {
              const num = typeof value === 'number' ? value : Number(value);
              return Number.isFinite(num) ? num.toFixed(2) : value;
            }
          }
        }
      };

    // 3) Line chart – estimation evolution over time
    const timeEntries = metrics
      .filter(m => m.estimatedResolutionHours != null || m.estimatedHours != null)
      .map(m => ({
        provider: m.aiProvider || m.provider,
        createdAt: m.createdAt ? new Date(m.createdAt) : null,
        hours: Number(m.estimatedResolutionHours ?? m.estimatedHours)
      }))
      .filter(e => e.provider && e.createdAt && isFinite(e.hours))
      .sort((a, b) => (a.createdAt!.getTime() - b.createdAt!.getTime()));

    if (timeEntries.length) {
      const labels = timeEntries.map(e => e.createdAt!.toLocaleTimeString());
      const seriesByProvider: Record<string, number[]> = {};
      providers.forEach(p => {
        seriesByProvider[p] = new Array(labels.length).fill(null);
      });
      timeEntries.forEach((e, idx) => {
        if (!seriesByProvider[e.provider]) {
          seriesByProvider[e.provider] = new Array(labels.length).fill(null);
        }
        seriesByProvider[e.provider][idx] = e.hours;
      });

      const datasets = providers.map(p => ({
        label: p,
        data: seriesByProvider[p],
        borderColor: p.toUpperCase().includes('GEMINI') ? '#2563eb' : '#16a34a',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.3
      }));

      this.estimationTrendLineData = { labels, datasets };
      const trendValues = timeEntries.map(e => e.hours);
      this.estimationTrendLineOptions = {
        responsive: true,
        plugins: {
          legend: { display: true },
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: '#222',
            font: { weight: 'bold', size: 10 },
            formatter: (value: any) => {
              const num = typeof value === 'number' ? value : Number(value);
              return Number.isFinite(num) ? num.toFixed(2) : '';
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            max: this.computeYAxisMax(trendValues)
          }
        }
      };
    } else {
      this.estimationTrendLineData = null;
      this.estimationTrendLineOptions = {};
    }

    // 4) Radar chart – multi-criteria comparison per model
    const radarLabels = [
      'Avg response time (sec)',
      'Avg estimated hours',
      'Estimation range (h)',
      'Explanation enabled (%)'
    ];
    const radarDatasets: any[] = [];
    const radarAllValues: number[] = [];

    providers.forEach(p => {
      const records = byProvider[p];
      const secs = records.map((m: any) => {
        const sec = m.analysisTimeSec != null
          ? Number(m.analysisTimeSec)
          : m.analysisTimeMs != null
            ? Number(m.analysisTimeMs) / 1000
            : 0;
        return isFinite(sec) ? sec : 0;
      });
      const estArr = records
        .map((m: any) => m.estimatedResolutionHours ?? m.estimatedHours)
        .filter((v: any) => v != null)
        .map((v: any) => Number(v));
      const explanationOn = records.filter((m: any) => m.explanationEnabled === true).length;
      const count = records.length || 1;

      const avgSec = secs.length ? secs.reduce((a, b) => a + b, 0) / secs.length : 0;
      const avgHours = estArr.length ? estArr.reduce((a, b) => a + b, 0) / estArr.length : 0;
      const rangeHours = estArr.length ? Math.max(...estArr) - Math.min(...estArr) : 0;
      const explanationRatio = (explanationOn / count) * 100;

      const values = [avgSec, avgHours, rangeHours, explanationRatio];
      radarAllValues.push(...values);

      const isGemini = p.toUpperCase().includes('GEMINI');
      radarDatasets.push({
        label: p,
        data: values,
        backgroundColor: isGemini ? 'rgba(37,99,235,0.15)' : 'rgba(22,163,74,0.15)',
        borderColor: isGemini ? '#2563eb' : '#16a34a',
        pointBackgroundColor: isGemini ? '#2563eb' : '#16a34a'
      });
    });

    this.comparisonRadarData = {
      labels: radarLabels,
      datasets: radarDatasets
    };
    this.comparisonRadarOptions = {
      responsive: true,
      plugins: {
        legend: { display: true },
        datalabels: {
          color: '#222',
          font: { weight: 'bold', size: 11 },
          formatter: (value: any) => {
            const num = typeof value === 'number' ? value : Number(value);
            return Number.isFinite(num) ? num.toFixed(2) : value;
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          suggestedMax: this.computeYAxisMax(radarAllValues)
        }
      }
    };
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
