import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HistoryService } from '../../services/history.service';
import { AIHistoryResult } from '../../models/history.models';
import { EstimationHistoryTableComponent } from '../../../features/history/estimation-history-table.component';

@Component({
  selector: 'app-estimation-history',
  standalone: true,
  imports: [CommonModule, EstimationHistoryTableComponent],
  templateUrl: './estimation-history.component.html',
  styleUrls: ['./estimation-history.component.scss']
})
export class EstimationHistoryComponent implements OnInit {
  isLoading = false;
  error = '';
  estimations: AIHistoryResult[] = [];

  constructor(private historyService: HistoryService) {}

  ngOnInit(): void {
    this.loadEstimations();
  }

  loadEstimations(): void {
    this.isLoading = true;
    this.error = '';
    this.historyService.getEstimations().subscribe({
      next: (data) => {
        this.estimations = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load estimation history', err);
        this.error = 'Failed to load estimation history.';
        this.isLoading = false;
      }
    });
  }
}
