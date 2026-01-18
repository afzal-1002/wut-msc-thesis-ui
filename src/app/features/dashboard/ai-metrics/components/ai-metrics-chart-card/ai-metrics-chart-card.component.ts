import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-ai-metrics-chart-card',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './ai-metrics-chart-card.component.html',
  styleUrls: ['./ai-metrics-chart-card.component.css']
})
export class AiMetricsChartCardComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() caption?: string;
  @Input() chartType: ChartType = 'bar';
  @Input() chartData: any;
  @Input() chartOptions: any;
  @Input() size: 'default' | 'compact' = 'default';
  @Input() emptyMessage = 'No data available for this visualization.';

  get hasData(): boolean {
    return Boolean(
      this.chartData &&
      Array.isArray(this.chartData.datasets) &&
      this.chartData.datasets.length
    );
  }
}
