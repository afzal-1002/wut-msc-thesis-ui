import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { AiEstimationsService } from '../../../../services/ai/ai-estimations.service';
import { Chart, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

interface ScoreRow {
  criterion: string;
  gemini: string;
  deepseek: string;
}

const errorBarsPlugin = {
  id: 'overallErrorBars',
  afterDatasetsDraw(chart: Chart) {
    const ctx = chart.ctx;
    chart.data.datasets.forEach((dataset: any, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta || meta.type !== 'bar' || !dataset.errorBars) return;
      meta.data.forEach((bar: any, index: number) => {
        const err = dataset.errorBars[index];
        if (!err) return;
        const yScale = chart.scales[meta.yAxisID || 'y'];
        const top = yScale.getPixelForValue(err.max);
        const bottom = yScale.getPixelForValue(err.min);
        const x = bar.x;
        ctx.save();
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.moveTo(x - 4, top);
        ctx.lineTo(x + 4, top);
        ctx.moveTo(x - 4, bottom);
        ctx.lineTo(x + 4, bottom);
        ctx.stroke();
        ctx.restore();
      });
    });
  }
};

let overallPluginsRegistered = false;
if (typeof window !== 'undefined' && !overallPluginsRegistered) {
  Chart.register(ChartDataLabels, errorBarsPlugin);
  overallPluginsRegistered = true;
}

@Component({
  selector: 'app-ai-overall-comparison',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './ai-overall-comparison.component.html',
  styleUrls: ['./ai-overall-comparison.component.css']
})
export class AiOverallComparisonComponent implements OnInit {
  isLoading = false;
  error = '';
  rawModels: any[] = [];

  performanceErrorBarData: any;
  performanceErrorBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#111827',
        font: { weight: 'bold', size: 12 },
        formatter: value => (typeof value === 'number' ? `${value.toFixed(2)}s` : value)
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        type: 'linear',
        beginAtZero: true,
        title: { display: true, text: 'Response time (s)' },
        grid: { color: '#e5e7eb' }
      }
    }
  };

  estimationGroupedData: any;
  estimationGroupedOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      datalabels: { anchor: 'end', align: 'end', formatter: v => `${Number(v).toFixed(1)}h` }
    },
    scales: { x: { grid: { display: false } }, y: { type: 'linear', beginAtZero: true, grid: { color: '#eee' } } }
  };

  stabilityLineData: any;
  stabilityLineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { position: 'bottom' }, datalabels: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: {
        type: 'linear',
        beginAtZero: true,
        position: 'left',
        title: { display: true, text: 'Stability score' }
      },
      y1: {
        type: 'linear',
        beginAtZero: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Std deviation (s)' }
      }
    }
  };

  contentBarData: any;
  contentBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { position: 'bottom' }, datalabels: { anchor: 'end', align: 'end' } },
    scales: {
      x: { grid: { display: false } },
      y: {
        type: 'linear',
        beginAtZero: true,
        max: 3,
        position: 'left',
        title: { display: true, text: 'Engineering relevance score' }
      },
      y1: {
        type: 'linear',
        beginAtZero: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Avg response length (k tokens)' }
      }
    }
  };

  overallRadarData: any;
  overallRadarOptions: ChartOptions<'radar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      datalabels: { color: '#111827', font: { size: 10 }, formatter: v => `${Math.round(Number(v) * 100)}%` }
    },
    scales: { r: { beginAtZero: true, suggestedMax: 1, ticks: { stepSize: 0.2 } } }
  };

  scorecardRows: ScoreRow[] = [];
  insights: string[] = [];

  constructor(private aiService: AiEstimationsService) {}

  ngOnInit(): void {
    this.fetchModels();
  }

  private fetchModels(): void {
    this.isLoading = true;
    this.error = '';
    this.aiService.getFullModelComparison().subscribe({
      next: raw => {
        this.rawModels = raw ?? [];
        this.buildCharts();
        this.isLoading = false;
      },
      error: err => {
        console.error('Overall comparison load error', err);
        this.error = 'Failed to load overall comparison.';
        this.isLoading = false;
      }
    });
  }

  private buildCharts(): void {
    if (!this.rawModels.length) return;
    const labels = this.rawModels.map(m => this.prettyName(m.aiProvider));
    const avg = this.rawModels.map(m => Number(m.avgResponseTimeSec ?? 0));
    const mins = this.rawModels.map(m => Number(m.minResponseTimeSec ?? 0));
    const maxs = this.rawModels.map(m => Number(m.maxResponseTimeSec ?? 0));
    const stds = this.rawModels.map(m => Number(m.stdDeviationResponseTime ?? 0));

    this.performanceErrorBarData = {
      labels,
      datasets: [
        {
          label: 'Avg response time (s)',
          data: avg,
          backgroundColor: ['#2563eb', '#16a34a'],
          borderRadius: 6,
          errorBars: maxs.map((max, idx) => ({ min: mins[idx], max }))
        }
      ]
    };

    const avgHours = this.rawModels.map(m => Number(m.avgEstimatedHours ?? 0));
    const minHours = this.rawModels.map(m => Number(m.minEstimatedHours ?? 0));
    const maxHours = this.rawModels.map(m => Number(m.maxEstimatedHours ?? 0));
    this.estimationGroupedData = {
      labels,
      datasets: [
        { label: 'Min (h)', data: minHours, backgroundColor: '#60a5fa', borderRadius: 4 },
        { label: 'Avg (h)', data: avgHours, backgroundColor: '#2563eb', borderRadius: 4 },
        { label: 'Max (h)', data: maxHours, backgroundColor: '#1e3a8a', borderRadius: 4 }
      ]
    };

    const stabilityScores = this.rawModels.map(m => Number(m.stabilityScore ?? 0));
    this.stabilityLineData = {
      labels,
      datasets: [
        {
          label: 'Stability score',
          data: stabilityScores,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14,165,233,0.2)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Std deviation (s)',
          data: stds,
          borderColor: '#f97316',
          backgroundColor: 'rgba(249,115,22,0.2)',
          tension: 0.3,
          fill: false,
          yAxisID: 'y1'
        }
      ]
    };

    const relevance = this.rawModels.map(m => Number(m.engineeringRelevanceScore ?? 0));
    const responseLengthK = this.rawModels.map(m => Number(m.avgResponseLength ?? 0) / 1000);
    this.contentBarData = {
      labels,
      datasets: [
        { label: 'Engineering relevance score', data: relevance, backgroundColor: '#22c55e', yAxisID: 'y', borderRadius: 4 },
        { label: 'Avg response length (k tokens)', data: responseLengthK, backgroundColor: '#0f62fe', yAxisID: 'y1', borderRadius: 4 }
      ]
    };

    this.buildRadar(avg, avgHours, stabilityScores, relevance, responseLengthK);
    this.buildScorecard();
    this.buildInsights();
  }

  private buildRadar(avgTime: number[], avgHours: number[], stability: number[], relevance: number[], lengthK: number[]): void {
    const gem = this.getModel('GEMINI');
    const deep = this.getModel('DEEPSEEK');
    if (!gem || !deep) return;

    const labels = ['Response speed', 'Estimation conservatism', 'Stability', 'Engineering relevance', 'Response verbosity'];
    const gemData = [
      this.normalizeMetric(gem.avgResponseTimeSec, avgTime, true),
      this.normalizeMetric(gem.avgEstimatedHours, avgHours, false),
      this.normalizeMetric(gem.stabilityScore, stability),
      this.normalizeMetric(gem.engineeringRelevanceScore, relevance),
      this.normalizeMetric(gem.avgResponseLength / 1000, lengthK)
    ];
    const deepData = [
      this.normalizeMetric(deep.avgResponseTimeSec, avgTime, true),
      this.normalizeMetric(deep.avgEstimatedHours, avgHours, false),
      this.normalizeMetric(deep.stabilityScore, stability),
      this.normalizeMetric(deep.engineeringRelevanceScore, relevance),
      this.normalizeMetric(deep.avgResponseLength / 1000, lengthK)
    ];

    this.overallRadarData = {
      labels,
      datasets: [
        {
          label: 'Gemini',
          data: gemData,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.25)',
          pointBackgroundColor: '#6366f1'
        },
        {
          label: 'DeepSeek',
          data: deepData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.25)',
          pointBackgroundColor: '#10b981'
        }
      ]
    };
  }

  private buildScorecard(): void {
    const gem = this.getModel('GEMINI');
    const deep = this.getModel('DEEPSEEK');
    if (!gem || !deep) {
      this.scorecardRows = [];
      return;
    }
    this.scorecardRows = [
      { criterion: 'Speed', gemini: `❌ ${gem.avgResponseTimeSec.toFixed(2)}s`, deepseek: `✅ ${deep.avgResponseTimeSec.toFixed(2)}s` },
      { criterion: 'Latency stability', gemini: `❌ σ ${gem.stdDeviationResponseTime.toFixed(2)}s`, deepseek: `✅ σ ${deep.stdDeviationResponseTime.toFixed(2)}s` },
      { criterion: 'Estimation conservatism', gemini: `✅ avg ${gem.avgEstimatedHours.toFixed(1)}h`, deepseek: `⚠️ avg ${deep.avgEstimatedHours.toFixed(1)}h` },
      { criterion: 'Engineering depth', gemini: `✅ ${gem.engineeringRelevanceScore.toFixed(2)}`, deepseek: `⚠️ ${deep.engineeringRelevanceScore.toFixed(2)}` },
      { criterion: 'Industry readiness', gemini: '✅ Enterprise proven', deepseek: '⚠️ Emerging stack' }
    ];
  }

  private buildInsights(): void {
    const gem = this.getModel('GEMINI');
    const deep = this.getModel('DEEPSEEK');
    if (!gem || !deep) {
      this.insights = [];
      return;
    }
    const speedDiff = ((gem.avgResponseTimeSec - deep.avgResponseTimeSec) / gem.avgResponseTimeSec) * 100;
    const estimateSpread = gem.maxEstimatedHours - gem.minEstimatedHours;
    const stabilityGap = deep.stabilityScore - gem.stabilityScore;
    this.insights = [
      `DeepSeek replies about ${speedDiff.toFixed(1)}% faster with tighter latency variance.`,
      `Gemini’s estimation window spans ${estimateSpread.toFixed(1)} hours, supplying conservative planning buffers.`,
      `DeepSeek’s stability score is ${(stabilityGap * 100).toFixed(1)} bps higher, indicating more repeatable behaviour.`,
      'Radar analysis supports a hybrid workflow: DeepSeek for rapid triage, Gemini for deep engineering analysis.'
    ];
  }

  private normalizeMetric(value: number, values: number[], lowerIsBetter = false): number {
    const finite = values.filter(v => Number.isFinite(v));
    if (!finite.length) return 0;
    const min = Math.min(...finite);
    const max = Math.max(...finite);
    if (max === min) return 1;
    return lowerIsBetter ? (max - value) / (max - min) : (value - min) / (max - min);
  }

  private prettyName(name: string): string {
    const val = (name ?? '').toUpperCase();
    if (val.includes('GEMINI')) return 'Gemini';
    if (val.includes('DEEP')) return 'DeepSeek';
    return name ?? '';
  }

  private getModel(key: 'GEMINI' | 'DEEPSEEK') {
    return this.rawModels.find(m => (m.aiProvider ?? '').toUpperCase() === key);
  }
}
