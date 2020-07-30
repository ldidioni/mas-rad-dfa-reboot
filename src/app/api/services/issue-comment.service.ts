import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IssueComment } from "src/app/models/issue-comment";
import { environment } from "../../../environments/environment";


@Injectable({
  providedIn: "root",
})
export class IssueCommentService
{
  constructor(private http: HttpClient) {}

  loadAllCommentsForIssue(issueId: number): Observable<Comment[]>
  {
    return this.http.get<Comment[]>(`${environment.apiUrl}/issues/${issueId}/comments?include=author`);
  }

  createCommentsForIssue(issueId: number, commentText: string): Observable<Comment>
  {
    return this.http.post<Comment>(`${environment.apiUrl}/issues/${issueId}/comments`, {"text": commentText});
  }
}