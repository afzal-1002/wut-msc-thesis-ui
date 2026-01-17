import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiIssueAnalysis } from '../../models/interface/ai-response.interface';
import { AiAnalyzeRequest } from '../../models/interface/ai-analysis-options.interface';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = `${environment.apiUrl}/api/wut/ai`;

  constructor(private http: HttpClient) {}

  // Legacy/simple usage: still available but now implemented via analyze endpoint
  getIssueAnalysis(issueKey: string): Observable<AiIssueAnalysis> {
    const request: AiAnalyzeRequest = {
      issueKey,
      userPrompt: '',
      markdown: true,
      explanation: true,
      aiModel: 'DEEPSEEK',
      temperature: 5.0
    };
    return this.analyzeIssue(request);
  }

  analyzeIssue(request: AiAnalyzeRequest): Observable<AiIssueAnalysis> {
    return this.http.post<AiIssueAnalysis>(`${this.apiUrl}/analyze`, request);
  }
}
