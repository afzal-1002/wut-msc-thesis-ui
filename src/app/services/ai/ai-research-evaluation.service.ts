import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiResearchEvaluationService {
  private baseUrl = `${environment.apiUrl}/api/wut/ai/research`;

  constructor(private http: HttpClient) {}

  getBiasAnalysis(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/bias`);
  }

  getExplainabilityTradeoff(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/explainability-tradeoff`);
  }

  getStabilityVariance(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stability-variance`);
  }

  getHumanInLoopImpact(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/human-in-loop`);
  }

  getHybridStrategy(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/hybrid-strategy`);
  }

  getResearchSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/summary`);
  }
}
