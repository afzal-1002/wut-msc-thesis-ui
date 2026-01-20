import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiLogService } from '../../services/api-log/api-log.service';
import { ApiRequestLog, ApiLogFilter, ApiLogStatistics } from '../../models/api-log.model';
import { ApiLogsListComponent } from './api-logs-list/api-logs-list.component';
import { ApiLogsFilterComponent } from './api-logs-filter/api-logs-filter.component';
import { ApiLogsFailedComponent } from './api-logs-failed/api-logs-failed.component';
import { ApiLogDetailsComponent } from './api-log-details/api-log-details.component';

@Component({
  selector: 'app-api-logs-dashboard',
  standalone: true,
  imports: [CommonModule, ApiLogsListComponent, ApiLogsFilterComponent, ApiLogsFailedComponent, ApiLogDetailsComponent],
  templateUrl: './api-logs-dashboard.component.html',
  styleUrls: ['./api-logs-dashboard.component.css'],
  providers: [ApiLogService]
})
export class ApiLogsDashboardComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  allLogs: ApiRequestLog[] = [];
  filteredLogs: ApiRequestLog[] = [];
  statistics: ApiLogStatistics | null = null;
  activeView: 'list' | 'failed' | 'filter' | 'details' = 'list';
  currentFilter: ApiLogFilter = {};
  selectedLog: ApiRequestLog | null = null;

  constructor(
    private apiLogService: ApiLogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllLogs();
  }

  loadAllLogs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiLogService.getAllLogs().subscribe({
      next: (logs: ApiRequestLog[]) => {
        this.isLoading = false;
        this.allLogs = logs;
        this.filteredLogs = logs;
        console.log('✅ All logs loaded:', logs);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('❌ Failed to load logs:', error);
        this.errorMessage = error?.error?.message || 'Failed to load API logs. Please try again.';
      }
    });
  }

  onFilterApplied(filter: ApiLogFilter): void {
    this.currentFilter = filter;
    this.isLoading = true;

    this.apiLogService.getLogsWithFilter(filter).subscribe({
      next: (logs: ApiRequestLog[]) => {
        this.isLoading = false;
        this.filteredLogs = logs;
        this.activeView = 'filter';
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to apply filters';
      }
    });
  }

  switchToFailedView(): void {
    this.activeView = 'failed';
    this.isLoading = true;

    this.apiLogService.getFailedLogs().subscribe({
      next: (logs: ApiRequestLog[]) => {
        this.isLoading = false;
        this.filteredLogs = logs;
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load failed logs';
      }
    });
  }

  switchToListView(): void {
    this.activeView = 'list';
    this.filteredLogs = this.allLogs;
  }

  switchToFilterView(): void {
    this.activeView = 'filter';
  }

  viewLogDetails(log: ApiRequestLog): void {
    this.selectedLog = log;
    this.activeView = 'details';
  }

  closeDetails(): void {
    this.selectedLog = null;
    this.activeView = 'list';
  }

  getFailedCount(): number {
    return this.filteredLogs.filter(log => !log.success).length;
  }

  getSuccessRate(): number {
    if (this.filteredLogs.length === 0) return 0;
    const successCount = this.filteredLogs.filter(log => log.success).length;
    return (successCount / this.filteredLogs.length) * 100;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
