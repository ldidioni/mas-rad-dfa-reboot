import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Issue } from "src/app/models/issue";
import { environment } from "../../../environments/environment";
import { IssueNewRequest } from 'src/app/models/issue-new-request';


@Injectable({
  providedIn: "root",
})
export class IssueService
{
  constructor(private http: HttpClient) {}

  loadAllIssues(): Observable<Issue[]>
  {
    return this.http.get<Issue[]>(`${environment.apiUrl}/issues`);
  }

  loadIssue(id: number): Observable<Issue>
  {
    return this.http.get<Issue>(`${environment.apiUrl}/issues/${id}`);
  }

  createIssue(issueReq: IssueNewRequest): Observable<Issue>
  {
    const headers = new HttpHeaders({ 'Content-type': 'application/json'});

    return this.http.post<Issue>(`${environment.apiUrl}/issues`, issueReq, { headers: headers });
  }

  updateIssue(issue: Issue): Observable<Issue>
  {
    return this.http.patch<Issue>(`${environment.apiUrl}/issues/${issue.id}`, issue);
  }

  initializeIssue(): Issue
  {
    return new Issue();
  }
}