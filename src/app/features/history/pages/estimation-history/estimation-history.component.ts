import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HistoryService } from '../../services/history.service';
import {
  AIHistoryResult,
  EstimationComparisonData,
  StabilityOverTimeData,
  PerformanceMetricsData,
  ExplanationImpactData,
  PromptImpactData,
  UsageDistributionData,
  FrequencyHeatmapData
} from '../../models/history.models';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { EstimationHistoryTableComponent } from '../../estimation-history-table.component';

@Component({
  selector: 'app-estimation-history',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, EstimationHistoryTableComponent],
  templateUrl: './estimation-history.component.html',
  styleUrls: ['./estimation-history.component.scss']
})
export class EstimationHistoryComponent implements OnInit {
  isLoading = false;
  error = '';
  estimations: AIHistoryResult[] = [];
  allIssues: string[] = [];
  selectedIssue = '';
  selectedProvider = '';

  // Chart Data
  estimationComparisonData: EstimationComparisonData[] = [];
  stabilityOverTimeData: StabilityOverTimeData[] = [];
  performanceMetricsData: PerformanceMetricsData[] = [];
  explanationImpactData: ExplanationImpactData[] = [];
  promptImpactData: PromptImpactData[] = [];
  usageDistributionData: UsageDistributionData[] = [];
  frequencyHeatmapData: FrequencyHeatmapData[] = [];

  // Chart Configurations
  estimationComparisonChartConfig: ChartConfiguration = { type: 'bar', data: {} as ChartData };
  stabilityOverTimeChartConfig: ChartConfiguration = { type: 'line', data: {} as ChartData };
  performanceChartConfig: ChartConfiguration = { type: 'bar', data: {} as ChartData };
  explanationImpactChartConfig: ChartConfiguration = { type: 'bar', data: {} as ChartData };
  promptImpactChartConfig: ChartConfiguration = { type: 'bar', data: {} as ChartData };
  usageDistributionChartConfig: ChartConfiguration = { type: 'doughnut', data: {} as ChartData };
  frequencyHeatmapChartConfig: ChartConfiguration = { type: 'bubble', data: {} as ChartData };

  constructor(private historyService: HistoryService, private router: Router) {}

  ngOnInit(): void {
    this.loadEstimations();
  }

  loadEstimations(): void {
    this.isLoading = true;
    this.error = '';
    this.historyService.getEstimations().subscribe({
      next: (data) => {
        this.estimations = data || [];
        this.extractIssues();
        this.processChartData(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load estimation history', err);
        this.error = 'Failed to load estimation history.';
        this.isLoading = false;
      }
    });
  }

  private extractIssues(): void {
    const issuesSet = new Set(this.estimations.map(e => e.issueKey));
    this.allIssues = Array.from(issuesSet).sort();
  }

  filterData(): void {
    let filtered = this.estimations;
    if (this.selectedIssue) {
      filtered = filtered.filter(e => e.issueKey === this.selectedIssue);
    }
    if (this.selectedProvider) {
      filtered = filtered.filter(e => e.aiProvider === this.selectedProvider);
    }
    this.processChartData(filtered);
  }

  private processChartData(data: AIHistoryResult[]): void {
    // Chart 1: Estimation Comparison
    this.estimationComparisonData = this.historyService.processEstimationComparison(data);
    this.initEstimationComparisonChart();

    // Chart 2: Stability Over Time
    this.stabilityOverTimeData = this.historyService.processStabilityOverTime(data);
    this.initStabilityOverTimeChart();

    // Chart 3: Performance Metrics
    this.performanceMetricsData = this.historyService.processPerformanceMetrics(data);
    this.initPerformanceChart();

    // Chart 4: Explanation Impact
    this.explanationImpactData = this.historyService.processExplanationImpact(data);
    this.initExplanationImpactChart();

    // Chart 5: Prompt Impact
    this.promptImpactData = this.historyService.processPromptImpact(data);
    this.initPromptImpactChart();

    // Chart 6: Usage Distribution
    this.usageDistributionData = this.historyService.processUsageDistribution(data);
    this.initUsageDistributionChart();

    // Chart 7: Frequency Heatmap
    this.frequencyHeatmapData = this.historyService.processFrequencyHeatmap(data);
    this.initFrequencyHeatmapChart();
  }

  private initEstimationComparisonChart(): void {
    const data = this.estimationComparisonData.map(d => Math.round(d.avgEstimation * 100) / 100);
    const maxValue = Math.max(...data);
    const axisMax = maxValue * 1.2; // Add 20% padding
    
    this.estimationComparisonChartConfig = {
      type: 'bar',
      data: {
        labels: this.estimationComparisonData.map(d => d.provider),
        datasets: [
          {
            label: 'Average Estimation (hours)',
            data: data,
            backgroundColor: '#3b82f6',
            borderColor: '#1e40af',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: 'end',
            align: 'top',
            font: { weight: 'bold' },
            formatter: (value: any) => (typeof value === 'number' ? value.toFixed(2) : value)
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: axisMax
          }
        }
      }
    };
  }

  private initStabilityOverTimeChart(): void {
    const geminiData = this.stabilityOverTimeData.map(d => d.geminiEstimation || null);
    const deepseekData = this.stabilityOverTimeData.map(d => d.deepseekEstimation || null);
    
    this.stabilityOverTimeChartConfig = {
      type: 'line',
      data: {
        labels: this.stabilityOverTimeData.map(d => d.date),
        datasets: [
          {
            label: 'GEMINI',
            data: geminiData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'DEEPSEEK',
            data: deepseekData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: true }
        }
      }
    };
  }

  private initPerformanceChart(): void {
    const data = this.performanceMetricsData.map(d => Math.round(d.avgAnalysisTime * 100) / 100);
    const maxValue = Math.max(...data);
    const axisMax = maxValue * 1.2; // Add 20% padding
    
    this.performanceChartConfig = {
      type: 'bar',
      data: {
        labels: this.performanceMetricsData.map(d => d.provider),
        datasets: [
          {
            label: 'Avg Analysis Time (sec)',
            data: data,
            backgroundColor: '#8b5cf6',
            borderColor: '#6d28d9',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: 'end',
            align: 'top',
            font: { weight: 'bold' },
            formatter: (value: any) => (typeof value === 'number' ? value.toFixed(2) : value)
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: axisMax
          }
        }
      }
    };
  }

  private initExplanationImpactChart(): void {
    const groupedByProvider = new Map<string, any>();
    
    this.explanationImpactData.forEach(item => {
      if (!groupedByProvider.has(item.provider)) {
        groupedByProvider.set(item.provider, { with: 0, without: 0 });
      }
      const group = groupedByProvider.get(item.provider);
      if (item.explanationEnabled) {
        group.with = Math.round(item.avgEstimation * 100) / 100;
      } else {
        group.without = Math.round(item.avgEstimation * 100) / 100;
      }
    });

    const providers = Array.from(groupedByProvider.keys());
    const withExplanation = providers.map(p => groupedByProvider.get(p).with);
    const withoutExplanation = providers.map(p => groupedByProvider.get(p).without);
    
    const allValues = [...withExplanation, ...withoutExplanation];
    const maxValue = Math.max(...allValues);
    const axisMax = maxValue * 1.2; // Add 20% padding

    this.explanationImpactChartConfig = {
      type: 'bar',
      data: {
        labels: providers,
        datasets: [
          {
            label: 'With Explanation',
            data: withExplanation,
            backgroundColor: '#10b981'
          },
          {
            label: 'Without Explanation',
            data: withoutExplanation,
            backgroundColor: '#f59e0b'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: true },
          datalabels: {
            anchor: 'end',
            align: 'top',
            font: { weight: 'bold' },
            formatter: (value: any) => (typeof value === 'number' ? value.toFixed(2) : value)
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: axisMax
          }
        }
      }
    };
  }

  private initPromptImpactChart(): void {
    const groupedByProvider = new Map<string, any>();
    
    this.promptImpactData.forEach(item => {
      if (!groupedByProvider.has(item.provider)) {
        groupedByProvider.set(item.provider, { with: 0, without: 0 });
      }
      const group = groupedByProvider.get(item.provider);
      if (item.promptProvided) {
        group.with = Math.round(item.avgEstimation * 100) / 100;
      } else {
        group.without = Math.round(item.avgEstimation * 100) / 100;
      }
    });

    const providers = Array.from(groupedByProvider.keys());
    const withPrompt = providers.map(p => groupedByProvider.get(p).with);
    const withoutPrompt = providers.map(p => groupedByProvider.get(p).without);
    
    const allValues = [...withPrompt, ...withoutPrompt];
    const maxValue = Math.max(...allValues);
    const axisMax = maxValue * 1.2; // Add 20% padding

    this.promptImpactChartConfig = {
      type: 'bar',
      data: {
        labels: providers,
        datasets: [
          {
            label: 'With User Prompt',
            data: withPrompt,
            backgroundColor: '#06b6d4'
          },
          {
            label: 'Without User Prompt',
            data: withoutPrompt,
            backgroundColor: '#ec4899'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: true },
          datalabels: {
            anchor: 'end',
            align: 'top',
            font: { weight: 'bold' },
            formatter: (value: any) => (typeof value === 'number' ? value.toFixed(2) : value)
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: axisMax
          }
        }
      }
    };
  }

  private initUsageDistributionChart(): void {
    this.usageDistributionChartConfig = {
      type: 'doughnut',
      data: {
        labels: this.usageDistributionData.map(d => `${d.provider} (${d.count})`),
        datasets: [
          {
            data: this.usageDistributionData.map(d => d.count),
            backgroundColor: ['#3b82f6', '#ef4444'],
            borderColor: '#ffffff',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: true, position: 'bottom' }
        }
      }
    };
  }

  private initFrequencyHeatmapChart(): void {
    // Simple bar chart representation of frequency data
    const providers = Array.from(new Set(this.frequencyHeatmapData.map(d => d.provider)));
    const ranges = ['2h', '4h', '8h', '12h', '16h', '20h+'];
    
    const datasets = providers.map((provider, idx) => ({
      label: provider,
      data: ranges.map(range => {
        const item = this.frequencyHeatmapData.find(d => d.provider === provider && d.estimationRange === range);
        return item?.frequency || 0;
      }),
      backgroundColor: idx === 0 ? '#3b82f6' : '#ef4444'
    }));

    const allValues = datasets.flatMap(d => d.data as number[]);
    const maxValue = Math.max(...allValues);
    const axisMax = maxValue * 1.2; // Add 20% padding

    this.frequencyHeatmapChartConfig = {
      type: 'bar',
      data: {
        labels: ranges,
        datasets: datasets as any
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: true },
          datalabels: {
            anchor: 'end',
            align: 'top',
            font: { weight: 'bold' },
            formatter: (value: any) => (typeof value === 'number' ? value.toFixed(0) : value)
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: axisMax
          }
        }
      }
    };
  }

  goBack(): void {
    this.router.navigate(['/history']);
  }
}
