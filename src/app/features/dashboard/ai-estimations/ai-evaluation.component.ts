import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { AiEstimationsService } from '../../../services/ai/ai-estimations.service';
import { forkJoin, Observable, of } from 'rxjs';

@Component({
  selector: 'app-ai-evaluation',
  templateUrl: './ai-evaluation.component.html',
  styleUrls: ['./ai-evaluation.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule]
})
export class AiEvaluationComponent {
  // Properties for template bindings
  isLoadingEvaluation = false;
  activeEvaluationTab: string = 'by-issue';
  evalIssueKey: string = '';
  evalProvider: string | null = null;
  stabilityIssueKey: string = '';
  evaluationResult: any = null;
  hasProviderStats = false;
  maxProviderAvgHours = 0;
  providerBarData: any;
  providerBarOptions: any;
  providerBarType: any;
  byIssueTimeBarData: any;
  byIssueTimeBarOptions: any;
  byIssueTimeBarType: any;
  byIssueAllStatsBarData: any;
  byIssueAllStatsBarOptions: any;
  byIssueAllStatsBarType: any;
  byIssueOverallBarData: any;
  byIssueOverallBarOptions: any;
  byIssueOverallBarType: any;
  modelComparisonAllStatsBarData: any;
  modelComparisonAllStatsBarOptions: any;
  modelComparisonAllStatsBarType: any;
  // Feature impact (Markdown) charts
  markdownEnabledPieData: any;
  markdownDisabledPieData: any;
  markdownPieOptions: any;
  markdownPieType: any;
  markdownBarData: any;
  markdownBarOptions: any;
  markdownBarType: any;
  modelStatsBarData: any;
  modelStatsBarOptions: any;
  modelStatsBarType: any;
  modelAllStatsBarData: any;
  modelAllStatsBarOptions: any;
  modelAllStatsBarType: any;
  // By AI Model charts
  modelByModelPieData: any;
  modelByModelPieOptions: any;
  modelByModelPieType: any;
  modelByModelBarData: any;
  modelByModelBarOptions: any;
  modelByModelBarType: any;
  // Stability (per issue) charts
  stabilityBarData: any;
  stabilityBarOptions: any;
  stabilityBarType: any;
  stabilityRadarData: any;
  stabilityRadarOptions: any;
  stabilityRadarType: any;
    stabilityPieData: any;
    stabilityPieOptions: any;
    stabilityPieType: any;
    stabilityLineData: any;
    stabilityLineOptions: any;
    stabilityLineType: any;
  // Model comparison (Gemini vs DeepSeek) charts
  comparisonPerfAvgBarData: any;
  comparisonPerfAvgBarOptions: any;
  comparisonPerfAvgBarType: any;
  comparisonPerfDetailBarData: any;
  comparisonPerfDetailBarOptions: any;
  comparisonPerfDetailBarType: any;

  // Methods for template actions
  goBack() {
    // Implement navigation logic here
    window.history.back();
  }

  constructor(private aiEstimationsService: AiEstimationsService) {}

  runEvaluation() {
    this.isLoadingEvaluation = true;
    this.evaluationResult = null;

    let request$: Observable<any> | null = null;

    switch (this.activeEvaluationTab) {
      case 'by-issue': {
        const key = (this.evalIssueKey || '').trim();
        if (!key) {
          this.isLoadingEvaluation = false;
          this.evaluationResult = { error: 'Please enter an issue key.' };
          return;
        }
        request$ = this.aiEstimationsService.getEvaluationByIssue(key);
        break;
      }
      case 'by-model': {
        const provider = (this.evalProvider || '').toString().trim();
        if (!provider) {
          this.isLoadingEvaluation = false;
          this.evaluationResult = { error: 'Please select an AI provider.' };
          return;
        }
        request$ = this.aiEstimationsService.getEvaluationByModel(provider);
        break;
      }
      case 'features': {
        // Uses evaluation feature-impact endpoint
        request$ = this.aiEstimationsService.getFeatureImpact();
        break;
      }
      case 'stability': {
        const key = (this.stabilityIssueKey || '').trim();
        if (!key) {
          this.isLoadingEvaluation = false;
          this.evaluationResult = { error: 'Please enter an issue key for stability analysis.' };
          return;
        }
        request$ = this.aiEstimationsService.getStabilityAnalysis(key);
        break;
      }
      case 'comparison': {
        // Aggregate all model-comparison endpoints into one result object
        request$ = forkJoin({
          full: this.aiEstimationsService.getFullModelComparison(),
          estimation: this.aiEstimationsService.getEstimationComparison(),
          stability: this.aiEstimationsService.getStabilityComparison(),
          content: this.aiEstimationsService.getContentQualityComparison(),
          performance: this.aiEstimationsService.getPerformanceComparison(),
          summary: this.aiEstimationsService.getComparisonSummary()
        });
        break;
      }
      default: {
        // Fallback: do nothing but keep UI consistent
        request$ = of({ info: 'No evaluation mode selected.' });
        break;
      }
    }

    request$?.subscribe({
      next: result => {
        this.evaluationResult = result;
        this.isLoadingEvaluation = false;

        if (this.activeEvaluationTab === 'by-issue') {
          this.prepareByIssueCharts(result);
        } else if (this.activeEvaluationTab === 'by-model') {
          this.prepareByModelCharts(result);
        } else if (this.activeEvaluationTab === 'features') {
          this.prepareFeatureImpactCharts(result);
        } else if (this.activeEvaluationTab === 'stability') {
          this.prepareStabilityCharts(result);
        } else if (this.activeEvaluationTab === 'comparison') {
          this.prepareModelComparisonCharts(result);
        }
      },
      error: err => {
        console.error('AI evaluation error', err);
        this.evaluationResult = { error: 'Failed to load evaluation. Check backend/API.', details: err?.message ?? err };
        this.isLoadingEvaluation = false;
      }
    });
  }

  private prepareByIssueCharts(result: any): void {
    if (!result || !result.providers) {
      this.hasProviderStats = false;
      return;
    }

    const providers = result.providers || {};
    const gemini = providers['GEMINI'] || providers['Gemini'] || {};
    const deepseek = providers['DEEPSEEK'] || providers['DeepSeek'] || {};

    const gAvgHours = Number(gemini.avghours ?? gemini.avgHours ?? 0);
    const dAvgHours = Number(deepseek.avghours ?? deepseek.avgHours ?? 0);
    const gAvgTimeSec = Number(gemini.avgTimeMS ?? gemini.avgTimeMs ?? 0) / 1000;
    const dAvgTimeSec = Number(deepseek.avgTimeMS ?? deepseek.avgTimeMs ?? 0) / 1000;
    const gRuns = Number(gemini.runs ?? 0);
    const dRuns = Number(deepseek.runs ?? 0);

    const totalRuns = Number(result.totalRuns ?? 0);
    const minHours = Number(result.minEstimatedHours ?? 0);
    const maxHours = Number(result.maxEstimatedHours ?? 0);
    const avgIssueHours = Number(result.avgEstimatedHours ?? 0);
    const avgIssueTimeSec = Number(result.avgAnalysisTimeMS ?? result.avgAnalysisTimeMs ?? 0) / 1000;

    // Chart 1: Average estimated hours by provider
    this.providerBarData = {
      labels: ['Gemini', 'DeepSeek'],
      datasets: [
        {
          data: [gAvgHours, dAvgHours],
          label: 'Avg estimated hours',
          backgroundColor: ['#1976d2', '#43a047'],
          borderRadius: 8,
          maxBarThickness: 40
        }
      ]
    };
    this.providerBarOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: this.computeYAxisMax([gAvgHours, dAvgHours])
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
    this.providerBarType = 'bar';
    this.maxProviderAvgHours = Math.max(gAvgHours, dAvgHours, 0);
    this.hasProviderStats = this.maxProviderAvgHours > 0;

    // Chart 2: Average analysis time (seconds) by provider
    this.byIssueTimeBarData = {
      labels: ['Gemini', 'DeepSeek'],
      datasets: [
        {
          data: [gAvgTimeSec, dAvgTimeSec],
          label: 'Avg analysis time (sec)',
          backgroundColor: ['#1976d2', '#43a047'],
          borderRadius: 8,
          maxBarThickness: 40
        }
      ]
    };
    this.byIssueTimeBarOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: this.computeYAxisMax([gAvgTimeSec, dAvgTimeSec])
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
    this.byIssueTimeBarType = 'bar';

    // Chart 3: All key stats (grouped bars for providers + overall issue)
    const labels = ['Avg est. hours', 'Avg time (sec)', 'Runs', 'Min est. hours', 'Max est. hours'];
    // Chart 3a: Gemini vs DeepSeek detailed stats
    this.byIssueAllStatsBarData = {
      labels,
      datasets: [
        {
          label: 'Gemini',
          backgroundColor: '#1976d2',
          data: [gAvgHours, gAvgTimeSec, gRuns, minHours, maxHours]
        },
        {
          label: 'DeepSeek',
          backgroundColor: '#43a047',
          data: [dAvgHours, dAvgTimeSec, dRuns, minHours, maxHours]
        }
      ]
    };
    const allStatValues: number[] = [
      gAvgHours, dAvgHours,
      gAvgTimeSec, dAvgTimeSec,
      gRuns, dRuns,
      avgIssueHours, avgIssueTimeSec,
      totalRuns,
      minHours, maxHours
    ];

    this.byIssueAllStatsBarOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: this.computeYAxisMax(allStatValues)
        }
      },
      plugins: {
        legend: { display: true },
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: '#222',
          font: { weight: 'bold', size: 11 },
          formatter: (value: any, context: any) => {
            const label = context?.chart?.data?.labels?.[context.dataIndex] as string | undefined;
            const num = typeof value === 'number' ? value : Number(value);
            if (label && label.toLowerCase().includes('runs')) {
              return Number.isFinite(num) ? Math.round(num).toString() : value;
            }
            return Number.isFinite(num) ? num.toFixed(2) : value;
          }
        }
      }
    };
    this.byIssueAllStatsBarType = 'bar';

    // Chart 3b: Issue overall stats only
    this.byIssueOverallBarData = {
      labels,
      datasets: [
        {
          label: 'Issue overall',
          backgroundColor: '#ff9800',
          data: [avgIssueHours, avgIssueTimeSec, totalRuns, minHours, maxHours]
        }
      ]
    };
    const overallValues: number[] = [
      avgIssueHours, avgIssueTimeSec, totalRuns, minHours, maxHours
    ];

    this.byIssueOverallBarOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: this.computeYAxisMax(overallValues)
        }
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: '#222',
          font: { weight: 'bold', size: 11 },
          formatter: (value: any, context: any) => {
            const label = context?.chart?.data?.labels?.[context.dataIndex] as string | undefined;
            const num = typeof value === 'number' ? value : Number(value);
            if (label && label.toLowerCase().includes('runs')) {
              return Number.isFinite(num) ? Math.round(num).toString() : value;
            }
            return Number.isFinite(num) ? num.toFixed(2) : value;
          }
        }
      }
    };
    this.byIssueOverallBarType = 'bar';
  }

  private prepareStabilityCharts(result: any): void {
    if (!result) {
      this.stabilityBarData = null;
      this.stabilityRadarData = null;
      return;
    }

    const issueKey = String(result.issueKey ?? result.issue ?? this.stabilityIssueKey ?? '').trim();
    const minHours = Number(result.minHours ?? result.minimumHours ?? 0);
    const avgHours = Number(result.avgHours ?? result.averageHours ?? 0);
    const maxHours = Number(result.maxHours ?? result.maximumHours ?? 0);
    const stdDevHours = Number(result.stdDeviationHours ?? result.stdDevHours ?? 0);

    const labels = ['Min hours', 'Avg hours', 'Max hours', 'Std dev (hours)'];
    const values = [minHours, avgHours, maxHours, stdDevHours];

    // Bar chart: stability summary for this issue
    this.stabilityBarData = {
      labels,
      datasets: [
        {
          label: issueKey ? `Stability for ${issueKey}` : 'Issue stability',
          data: values,
          backgroundColor: ['#66bb6a', '#42a5f5', '#ef5350', '#ffa726'],
          borderRadius: 8,
          maxBarThickness: 40
        }
      ]
    };
    this.stabilityBarOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: this.computeYAxisMax(values)
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
    this.stabilityBarType = 'bar';

    // Line chart: same metrics over a simple index axis
    this.stabilityLineData = {
      labels,
      datasets: [
        {
          label: issueKey ? `Stability (hours) - ${issueKey}` : 'Stability (hours)',
          data: values,
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.2)',
          fill: true,
          tension: 0.3
        }
      ]
    };
    this.stabilityLineOptions = {
      responsive: true,
      plugins: {
        legend: { display: true },
        datalabels: {
          anchor: 'end',
          align: 'top',
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
        y: { beginAtZero: true, max: this.computeYAxisMax(values) }
      }
    };
    this.stabilityLineType = 'line';

    // Pie chart: share of each stability metric in hours
    this.stabilityPieData = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ['#66bb6a', '#42a5f5', '#ef5350', '#ffa726']
        }
      ]
    };
    this.stabilityPieOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        datalabels: {
          color: '#222',
          font: { weight: 'bold', size: 12 },
          formatter: (value: any) => {
            const num = typeof value === 'number' ? value : Number(value);
            return Number.isFinite(num) ? num.toFixed(2) : value;
          }
        }
      }
    };
    this.stabilityPieType = 'pie';

    // Radar chart: same metrics in radial form
    this.stabilityRadarData = {
      labels,
      datasets: [
        {
          label: issueKey || 'Issue',
          data: values,
          backgroundColor: 'rgba(25, 118, 210, 0.2)',
          borderColor: '#1976d2',
          pointBackgroundColor: '#1976d2',
          pointBorderColor: '#1976d2'
        }
      ]
    };
    this.stabilityRadarOptions = {
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
          suggestedMax: this.computeYAxisMax(values)
        }
      }
    };
    this.stabilityRadarType = 'radar';
  }

  private prepareFeatureImpactCharts(result: any): void {
    if (!result) {
      this.markdownEnabledPieData = null;
      this.markdownDisabledPieData = null;
      this.markdownBarData = null;
      return;
    }

    const enabledRaw = result.markdownEnabled || result.MarkdownEnabled || {};
    const disabledRaw = result.markdownDisabled || result.MarkdownDisabled || {};

    const enabledRuns = Number(enabledRaw.runs ?? enabledRaw.totalRuns ?? 0);
    const disabledRuns = Number(disabledRaw.runs ?? disabledRaw.totalRuns ?? 0);

    const enabledTimeSec = Number(
      enabledRaw.avgTimeMS ?? enabledRaw.avgTimeMs ?? enabledRaw.avgAnalysisTimeMS ?? enabledRaw.avgAnalysisTimeMs ?? 0
    ) / 1000;
    const disabledTimeSec = Number(
      disabledRaw.avgTimeMS ?? disabledRaw.avgTimeMs ?? disabledRaw.avgAnalysisTimeMS ?? disabledRaw.avgAnalysisTimeMs ?? 0
    ) / 1000;

    // Two pie charts: one for Markdown enabled, one for Markdown disabled
    this.markdownEnabledPieData = {
      labels: ['Total runs', 'Avg analysis time (sec)'],
      datasets: [
        {
          data: [enabledRuns, enabledTimeSec],
          backgroundColor: ['#42a5f5', '#66bb6a']
        }
      ]
    };

    this.markdownDisabledPieData = {
      labels: ['Total runs', 'Avg analysis time (sec)'],
      datasets: [
        {
          data: [disabledRuns, disabledTimeSec],
          backgroundColor: ['#ef6c00', '#ab47bc']
        }
      ]
    };

    this.markdownPieOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        datalabels: {
          color: '#222',
          font: { weight: 'bold', size: 12 },
          formatter: (value: any, context: any) => {
            const label = context?.chart?.data?.labels?.[context.dataIndex] as string | undefined;
            const num = typeof value === 'number' ? value : Number(value);
            if (label && label.toLowerCase().includes('runs')) {
              return Number.isFinite(num) ? Math.round(num).toString() : value;
            }
            return Number.isFinite(num) ? num.toFixed(2) : value;
          }
        }
      }
    };
    this.markdownPieType = 'pie';

    // Bar chart: enabled vs disabled for runs and analysis time (seconds)
    const barLabels = ['Total runs', 'Avg analysis time (sec)'];
    const enabledValues = [enabledRuns, enabledTimeSec];
    const disabledValues = [disabledRuns, disabledTimeSec];
    const allValues = [...enabledValues, ...disabledValues];

    this.markdownBarData = {
      labels: barLabels,
      datasets: [
        {
          label: 'Markdown enabled',
          data: enabledValues,
          backgroundColor: '#42a5f5',
          borderRadius: 8,
          maxBarThickness: 40
        },
        {
          label: 'Markdown disabled',
          data: disabledValues,
          backgroundColor: '#ef6c00',
          borderRadius: 8,
          maxBarThickness: 40
        }
      ]
    };

    this.markdownBarOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: this.computeYAxisMax(allValues)
        }
      },
      plugins: {
        legend: { display: true },
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: '#222',
          font: { weight: 'bold', size: 12 },
          formatter: (value: any, context: any) => {
            const label = context?.chart?.data?.labels?.[context.dataIndex] as string | undefined;
            const num = typeof value === 'number' ? value : Number(value);
            if (label && label.toLowerCase().includes('runs')) {
              return Number.isFinite(num) ? Math.round(num).toString() : value;
            }
            return Number.isFinite(num) ? num.toFixed(2) : value;
          }
        }
      }
    };
    this.markdownBarType = 'bar';
  }

  private prepareByModelCharts(result: any): void {
    if (!result) {
      this.modelByModelPieData = null;
      this.modelByModelBarData = null;
      return;
    }

    const totalRuns = Number(result.totalRuns ?? 0);
    const uniqueIssues = Number(result.uniqueIssues ?? result.distinctIssues ?? 0);
    const avgAnalysisTimeSec = Number(result.avgAnalysisTimeMS ?? result.avgAnalysisTimeMs ?? 0) / 1000;
    const avgEstimatedHours = Number(result.avgEstimatedHours ?? result.avgHours ?? 0);

    // Pie chart: total runs vs avg analysis time (sec) vs avg estimated hours
    this.modelByModelPieData = {
      labels: ['Total runs', 'Avg analysis time (sec)', 'Avg estimated hours'],
      datasets: [
        {
          data: [totalRuns, avgAnalysisTimeSec, avgEstimatedHours],
          backgroundColor: ['#42a5f5', '#66bb6a', '#ffca28']
        }
      ]
    };
    this.modelByModelPieOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        datalabels: {
          color: '#222',
          font: { weight: 'bold', size: 12 },
          formatter: (value: any, context: any) => {
            const label = context?.chart?.data?.labels?.[context.dataIndex] as string | undefined;
            const num = typeof value === 'number' ? value : Number(value);
            if (label && (label.toLowerCase().includes('runs') || label.toLowerCase().includes('issues'))) {
              return Number.isFinite(num) ? Math.round(num).toString() : value;
            }
            return Number.isFinite(num) ? num.toFixed(2) : value;
          }
        }
      }
    };
    this.modelByModelPieType = 'pie';

    // Bar chart: all key numeric stats for this model (time shown in seconds)
    const barLabels = ['Total runs', 'Unique issues', 'Avg analysis time (sec)', 'Avg estimated hours'];
    const barValues = [totalRuns, uniqueIssues, avgAnalysisTimeSec, avgEstimatedHours];

    this.modelByModelBarData = {
      labels: barLabels,
      datasets: [
        {
          label: 'Model statistics',
          data: barValues,
          backgroundColor: '#42a5f5',
          borderRadius: 8,
          maxBarThickness: 40
        }
      ]
    };
    this.modelByModelBarOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: this.computeYAxisMax(barValues)
        }
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: '#222',
          font: { weight: 'bold', size: 12 },
          formatter: (value: any, context: any) => {
            const label = context?.chart?.data?.labels?.[context.dataIndex] as string | undefined;
            const num = typeof value === 'number' ? value : Number(value);
            if (label && (label.toLowerCase().includes('runs') || label.toLowerCase().includes('issues'))) {
              return Number.isFinite(num) ? Math.round(num).toString() : value;
            }
            return Number.isFinite(num) ? num.toFixed(2) : value;
          }
        }
      }
    };
    this.modelByModelBarType = 'bar';
  }

  // Prepare charts for Model Comparison tab (Gemini vs DeepSeek, performance dimension)
  private prepareModelComparisonCharts(result: any): void {
    const full = result?.full;
    if (!Array.isArray(full) || !full.length) {
      this.comparisonPerfAvgBarData = null;
      this.comparisonPerfDetailBarData = null;
      return;
    }

    const labels = full.map((m: any) => (m.aiProvider === 'GEMINI' ? 'Gemini' : m.aiProvider === 'DEEPSEEK' ? 'DeepSeek' : String(m.aiProvider)));
    const mins = full.map((m: any) => Number(m.minResponseTimeSec ?? 0));
    const avgs = full.map((m: any) => Number(m.avgResponseTimeSec ?? 0));
    const maxs = full.map((m: any) => Number(m.maxResponseTimeSec ?? 0));
    const stds = full.map((m: any) => Number(m.stdDeviationResponseTime ?? 0));

    // Chart A: Average response time per model (simple comparison)
    this.comparisonPerfAvgBarData = {
      labels,
      datasets: [
        {
          data: avgs,
          label: 'Avg response time (s)',
          backgroundColor: ['#1976d2', '#43a047'],
          borderRadius: 8,
          maxBarThickness: 40
        }
      ]
    };
    this.comparisonPerfAvgBarOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#eee' },
          max: this.computeYAxisMax(avgs)
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
    this.comparisonPerfAvgBarType = 'bar';

    // Chart B: Detailed distribution (min, avg, max, std dev) per model
    this.comparisonPerfDetailBarData = {
      labels,
      datasets: [
        {
          label: 'Min (s)',
          data: mins,
          backgroundColor: 'rgba(76, 175, 80, 0.8)',
          borderRadius: 8,
          maxBarThickness: 36
        },
        {
          label: 'Avg (s)',
          data: avgs,
          backgroundColor: 'rgba(33, 150, 243, 0.9)',
          borderRadius: 8,
          maxBarThickness: 36
        },
        {
          label: 'Max (s)',
          data: maxs,
          backgroundColor: 'rgba(244, 67, 54, 0.85)',
          borderRadius: 8,
          maxBarThickness: 36
        },
        {
          label: 'Std dev (s)',
          data: stds,
          backgroundColor: 'rgba(255, 193, 7, 0.9)',
          borderRadius: 8,
          maxBarThickness: 36
        }
      ]
    };
    const perfDetailValues: number[] = [...mins, ...avgs, ...maxs, ...stds];

    this.comparisonPerfDetailBarOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#eee' },
          max: this.computeYAxisMax(perfDetailValues)
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
    this.comparisonPerfDetailBarType = 'bar';
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
