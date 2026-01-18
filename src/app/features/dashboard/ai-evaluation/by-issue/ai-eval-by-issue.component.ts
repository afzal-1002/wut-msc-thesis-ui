import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-ai-eval-by-issue',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './ai-eval-by-issue.component.html',
  styleUrls: ['./ai-eval-by-issue.component.css']
})
export class AiEvalByIssueComponent {
  @Input() hasProviderStats = false;
  @Input() maxProviderAvgHours = 0;
  @Input() providerBarData: any;
  @Input() providerBarOptions: any;
  @Input() providerBarType: any = 'bar';
  @Input() byIssueTimeBarData: any;
  @Input() byIssueTimeBarOptions: any;
  @Input() byIssueTimeBarType: any = 'bar';
  @Input() byIssueAllStatsBarData: any;
  @Input() byIssueAllStatsBarOptions: any;
  @Input() byIssueAllStatsBarType: any = 'bar';
  @Input() byIssueOverallBarData: any;
  @Input() byIssueOverallBarOptions: any;
  @Input() byIssueOverallBarType: any = 'bar';
}
