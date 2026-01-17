import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AIHistoryResult,
  AccuracyTrendResult,
  ModelComparisonResult,
  ExplainabilityHistoryResult,
  HumanInLoopHistoryResult,
  StabilityHistoryResult,
  AIResponseArchive
} from '../models/history.models';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private base = `${environment.apiUrl}/api/wut/ai/history`;

  constructor(private http: HttpClient) {}

  getEstimations(params?: Record<string, any>): Observable<AIHistoryResult[]> {
    const httpParams = new HttpParams({ fromObject: params || {} });
    return this.http.get<AIHistoryResult[]>(`${this.base}/estimations`, { params: httpParams });
  }

  getAccuracyTrend(provider: string): Observable<AccuracyTrendResult[]> {
    const params = new HttpParams().set('aiProvider', provider);
    return this.http.get<AccuracyTrendResult[]>(`${this.base}/accuracy-trend`, { params });
  }

  getModelComparison(): Observable<ModelComparisonResult[]> {
    return this.http.get<ModelComparisonResult[]>(`${this.base}/model-comparison`);
  }

  getExplainabilityImpact(): Observable<ExplainabilityHistoryResult[]> {
    return this.http.get<ExplainabilityHistoryResult[]>(`${this.base}/explainability-impact`);
  }

  getHumanInLoop(): Observable<HumanInLoopHistoryResult[]> {
    return this.http.get<HumanInLoopHistoryResult[]>(`${this.base}/human-in-loop`);
  }

  getStability(): Observable<StabilityHistoryResult[]> {
    return this.http.get<StabilityHistoryResult[]>(`${this.base}/stability`);
  }

  getRaw(issueKey: string): Observable<AIResponseArchive> {
    return this.http.get<AIResponseArchive>(`${this.base}/raw/${encodeURIComponent(issueKey)}`);
  }
}
