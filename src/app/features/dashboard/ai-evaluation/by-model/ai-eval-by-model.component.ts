import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-ai-eval-by-model',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './ai-eval-by-model.component.html',
  styleUrls: ['./ai-eval-by-model.component.css']
})
export class AiEvalByModelComponent {
  @Input() modelByModelPieData: any;
  @Input() modelByModelPieOptions: any;
  @Input() modelByModelPieType: any = 'pie';
  @Input() modelByModelBarData: any;
  @Input() modelByModelBarOptions: any;
  @Input() modelByModelBarType: any = 'bar';
}
