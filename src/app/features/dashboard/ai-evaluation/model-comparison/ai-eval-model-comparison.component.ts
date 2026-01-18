import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-ai-eval-model-comparison',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './ai-eval-model-comparison.component.html',
  styleUrls: ['./ai-eval-model-comparison.component.css']
})
export class AiEvalModelComparisonComponent {
  @Input() comparisonPerfAvgBarData: any;
  @Input() comparisonPerfAvgBarOptions: any;
  @Input() comparisonPerfAvgBarType: any = 'bar';
  @Input() comparisonPerfDetailBarData: any;
  @Input() comparisonPerfDetailBarOptions: any;
  @Input() comparisonPerfDetailBarType: any = 'bar';
}
