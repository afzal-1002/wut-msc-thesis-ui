import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-ai-eval-feature-impact',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './ai-eval-feature-impact.component.html',
  styleUrls: ['./ai-eval-feature-impact.component.css']
})
export class AiEvalFeatureImpactComponent {
  @Input() markdownEnabledPieData: any;
  @Input() markdownDisabledPieData: any;
  @Input() markdownPieOptions: any;
  @Input() markdownPieType: any = 'pie';
  @Input() markdownBarData: any;
  @Input() markdownBarOptions: any;
  @Input() markdownBarType: any = 'bar';
}
