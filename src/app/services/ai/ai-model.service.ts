import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AiIssueAnalysis } from '../../models/interface/ai-response.interface';
import { AiIssueAnalysisOptions, AiChatRequest, DeepSeekChatPayload } from '../../models/interface/ai-analysis-options.interface';

// Note: backend base URL for AI models is separate (port 8084).
// In production you may want to proxy this via environment.apiUrl instead.
const AI_BASE_URL = 'http://localhost:8084';

@Injectable({
  providedIn: 'root'
})
export class AiModelService {
  constructor(private http: HttpClient) {}

  /**
   * Gemini: generate analysis for an issue, optional attachment handling.
   */
  generateGeminiIssueAnalysis(options: AiIssueAnalysisOptions): Observable<AiIssueAnalysis> {
    const { issueKey, markdown, explanation, includeAttachment } = options;

    const basePath = includeAttachment
      ? `/api/wut/model/gemini/generate-with-attachment/${issueKey}`
      : `/api/wut/model/gemini/generate/${issueKey}`;

    const params = new HttpParams()
      .set('markdown', String(markdown))
      .set('explanation', String(explanation));

    return this.http.get<AiIssueAnalysis>(`${AI_BASE_URL}${basePath}`, { params });
  }

  /**
   * Gemini chat endpoint. The concrete payload/response shape can be
   * refined later once the backend contract is finalized.
   */
  geminiChat(request: AiChatRequest): Observable<any> {
    const url = `${AI_BASE_URL}/api/wut/model/gemini/chat`;
    return this.http.post<any>(url, {
      message: request.message,
      markdown: request.markdown,
      explanation: request.explanation
    });
  }

  /**
   * DeepSeek simple generate endpoint, using a single message string.
   */
  deepSeekGenerate(message: string): Observable<string> {
    const params = new HttpParams().set('message', message);
    return this.http.get(`${AI_BASE_URL}/api/wut/model/deepseek/generate`, {
      params,
      responseType: 'text'
    });
  }

  /**
   * DeepSeek chat endpoint with full payload control.
   */
  deepSeekChat(payload: DeepSeekChatPayload): Observable<any> {
    const url = `${AI_BASE_URL}/api/wut/model/deepseek/chat`;
    return this.http.post<any>(url, payload);
  }

  /**
   * DeepSeek: analyze a Jira issue with markdown/explanation flags.
   */
  deepSeekIssueAnalysis(options: AiIssueAnalysisOptions): Observable<AiIssueAnalysis> {
    const { issueKey, markdown, explanation } = options;

    const params = new HttpParams()
      .set('markdown', String(markdown))
      .set('explanation', String(explanation));

    return this.http.get<AiIssueAnalysis>(
      `${AI_BASE_URL}/api/wut/model/deepseek/issue/${issueKey}`,
      { params }
    );
  }
}
