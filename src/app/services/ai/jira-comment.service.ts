import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface JiraCommentVisibility {
  type: string;
  value: string;
}

export interface JiraCommentBodyContentNode {
  type: string;
  text?: string;
  content?: JiraCommentBodyContentNode[];
  attrs?: any;
}

export interface JiraCommentUpdateRequest {
  body: {
    type: 'doc';
    version: number;
    content: JiraCommentBodyContentNode[];
  };
  visibility?: JiraCommentVisibility;
  public?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class JiraCommentService {
  private apiUrl = `${environment.apiUrl}/api/wut/jira/comment`;

  constructor(private http: HttpClient) {}

  updateFullComment(issueKey: string, request: JiraCommentUpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${issueKey}`, request);
  }

  createComment(issueKey: string, request: JiraCommentUpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${issueKey}`, request);
  }
}
