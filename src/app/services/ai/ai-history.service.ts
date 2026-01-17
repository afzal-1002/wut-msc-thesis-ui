import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EstimationHistoryRecord {
  issueKey: string;
  projectKey?: string;
  aiProvider: string;
  createdAt: string; // ISO date string
  estimatedHours: number;
  actualHours?: number;
  explanationEnabled?: boolean;
  userPromptProvided?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AiHistoryService {
  private baseUrl = `${environment.apiUrl}/api/wut/ai/history`;

  constructor(private http: HttpClient) {}

  getEstimationHistory(): Observable<EstimationHistoryRecord[]> {
    return this.http.get<EstimationHistoryRecord[]>(`${this.baseUrl}/estimations`);
  }
}
