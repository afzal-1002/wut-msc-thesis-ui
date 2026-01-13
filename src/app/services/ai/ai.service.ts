import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiIssueAnalysis } from '../../models/interface/ai-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = `${environment.apiUrl}/api/wut/ai/gemini`;

  constructor(private http: HttpClient) {}

  getIssueAnalysis(issueKey: string): Observable<AiIssueAnalysis> {
    return this.http.get<AiIssueAnalysis>(`${this.apiUrl}/generate/${issueKey}`);
  }
}
