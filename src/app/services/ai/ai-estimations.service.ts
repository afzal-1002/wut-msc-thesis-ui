import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiEstimationsService {
  private baseEvaluationUrl = `${environment.apiUrl}/api/wut/ai/evaluation`;
  private baseMetricsUrl = `${environment.apiUrl}/api/wut/ai/metrics`;
  private baseComparisonUrl = `${environment.apiUrl}/api/wut/ai/comparison`;

  constructor(private http: HttpClient) {}

  // Evaluation endpoints
  getEvaluationByIssue(issueKey: string): Observable<any> {
    return this.http.get<any>(`${this.baseEvaluationUrl}/issue/${issueKey}`);
  }

  getEvaluationByModel(provider: string): Observable<any> {
    return this.http.get<any>(`${this.baseEvaluationUrl}/model/${provider}`);
  }

  getModelComparison(): Observable<any> {
    return this.http.get<any>(`${this.baseEvaluationUrl}/compare`);
  }

  getFeatureImpact(): Observable<any> {
    return this.http.get<any>(`${this.baseEvaluationUrl}/features`);
  }

  getStabilityAnalysis(issueKey: string): Observable<any> {
    return this.http.get<any>(`${this.baseEvaluationUrl}/stability/${issueKey}`);
  }

  // Metrics endpoints
  getMetricsByIssue(issueKey: string): Observable<any> {
    return this.http.get<any>(`${this.baseMetricsUrl}/issue/${issueKey}`);
  }

  getMetricsByProvider(provider: string): Observable<any> {
    return this.http.get<any>(`${this.baseMetricsUrl}/provider/${provider}`);
  }

  getMetricsByHoursLte(hours: number): Observable<any> {
    return this.http.get<any>(`${this.baseMetricsUrl}/hours/lessthan-equal/${hours}`);
  }

  getMetricsByHoursGt(hours: number): Observable<any> {
    return this.http.get<any>(`${this.baseMetricsUrl}/hours/greaterthan/${hours}`);
  }

  getMetricsByDaysLte(days: number): Observable<any> {
    return this.http.get<any>(`${this.baseMetricsUrl}/days/lessthan-equal/${days}`);
  }

  getMetricsByDaysGt(days: number): Observable<any> {
    return this.http.get<any>(`${this.baseMetricsUrl}/days/greaterthan/${days}`);
  }

  getMetricsByMarkdown(enabled: boolean): Observable<any> {
    return this.http.get<any>(`${this.baseMetricsUrl}/markdown/${enabled}`);
  }

  getMetricsByExplanation(enabled: boolean): Observable<any> {
    return this.http.get<any>(`${this.baseMetricsUrl}/explanation/${enabled}`);
  }

  // Comparison endpoints (Gemini vs DeepSeek etc.)
  getFullModelComparison(): Observable<any> {
    return this.http.get<any>(`${this.baseComparisonUrl}/full`);
  }

  getPerformanceComparison(): Observable<any> {
    return this.http.get<any>(`${this.baseComparisonUrl}/performance`);
  }

  getEstimationComparison(): Observable<any> {
    return this.http.get<any>(`${this.baseComparisonUrl}/estimation`);
  }

  getContentQualityComparison(): Observable<any> {
    return this.http.get<any>(`${this.baseComparisonUrl}/content`);
  }

  getStabilityComparison(): Observable<any> {
    return this.http.get<any>(`${this.baseComparisonUrl}/stability`);
  }

  getComparisonSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseComparisonUrl}/summary`);
  }

  // Response time comparison endpoints (performance tab details)
  getResponseTimeStats(): Observable<any> {
	return this.http.get<any>(`${this.baseComparisonUrl}/response-time`);
  }

  getResponseTimeSummary(): Observable<any> {
	return this.http.get<any>(`${this.baseComparisonUrl}/response-time/summary`);
  }

  // Dashboard endpoints - AI Evaluations
  /**
   * Get all issues with AI evaluation metrics
   * Used for bug/issue filtering in AI Metrics dashboard
   * @returns Array of issues with estimation data
   */
  getAllIssuesMetrics(): Observable<any> {
    return this.http.get<any>(`${this.baseEvaluationUrl}/issues`);
  }

  /**
   * Get overall summary of AI evaluations across all issues
   * Used for dashboard overview and research analysis
   * @returns Summary statistics and analysis
   */
  getEvaluationSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseEvaluationUrl}/summary`);
  }

  // =====================================================
  // 📊 ANALYTICS / DASHBOARD SUMMARY ENDPOINTS
  // =====================================================

  /**
   * Get summary statistics for all issues
   * @returns List of summary objects for all issues
   */
  getAllIssuesSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseMetricsUrl}/summary/issues`);
  }

  /**
   * Get summary statistics for a specific issue
   * @param issueKey Issue key (e.g., BUG-123)
   * @returns Summary object for the issue
   */
  getIssueSummary(issueKey: string): Observable<any> {
    return this.http.get<any>(`${this.baseMetricsUrl}/summary/issue/${issueKey}`);
  }

  /**
   * Get summary statistics for a specific AI provider
   * @param provider AI provider name (e.g., GEMINI, DEEPSEEK)
   * @returns Summary object for the provider
   */
  getProviderSummary(provider: string): Observable<any> {
    return this.http.get<any>(`${this.baseMetricsUrl}/summary/provider/${provider}`);
  }

  /**
   * Get overall summary statistics across all data
   * @returns Overall metrics summary object
   */
  getOverallSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseMetricsUrl}/summary/overall`);
  }

  /**
   * Get all metrics records from the system
   * Used to extract unique issue keys for filtering and analysis
   * @returns Array of all metrics records with issue keys
   */
  getAllMetrics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseMetricsUrl}`);
  }
}
