import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-ai-eval-stability',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './ai-eval-stability.component.html',
  styleUrls: ['./ai-eval-stability.component.css']
})
export class AiEvalStabilityComponent {
  @Input() issueLabel = '';
  @Input() stabilityBarData: any;
  @Input() stabilityBarOptions: any;
  @Input() stabilityBarType: any = 'bar';
  @Input() stabilityLineData: any;
  @Input() stabilityLineOptions: any;
  @Input() stabilityLineType: any = 'line';
  @Input() stabilityPieData: any;
  @Input() stabilityPieOptions: any;
  @Input() stabilityPieType: any = 'pie';
  @Input() stabilityRadarData: any;
  @Input() stabilityRadarOptions: any;
  @Input() stabilityRadarType: any = 'radar';
}
