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
}
