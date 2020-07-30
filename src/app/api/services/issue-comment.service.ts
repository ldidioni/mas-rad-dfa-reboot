import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { IssueComment } from "src/app/models/issue-comment";
import { environment } from "../../../environments/environment";


@Injectable({
  providedIn: "root",
})
export class IssueCommentService
{
  constructor(private http: HttpClient) {}

  loadAllCommentsForIssue(issueId: string): Observable<IssueComment[]>
  {
    return this.http.get<IssueComment[]>(`${environment.apiUrl}/issues/${issueId}/comments?include=author`);
  }

  createCommentForIssue(issueId: string, commentText: string): Observable<IssueComment>
  {
    const headers = new HttpHeaders({ 'Content-type': 'application/json'});

    return this.http.post<IssueComment>(`${environment.apiUrl}/issues/${issueId}/comments`, {"text": commentText}, { headers: headers });
  }
}