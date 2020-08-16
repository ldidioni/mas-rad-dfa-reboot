import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Issue } from "src/app/models/issue";
import { environment } from "../../../environments/environment";
import { IssueNewRequest } from 'src/app/models/issue-new-request';
import { mergeMap } from 'rxjs/operators';


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

  loadAllIssuesWithDetails(): Observable<Issue[]>
  {
    return this.http.get<Issue[]>(`${environment.apiUrl}/issues?include=creator&include=issueType&include=assignee`);
  }

  searchIssues(queryObject: any): Observable<Issue[]>
  {
    const headers = new HttpHeaders({ 'Content-type': 'application/json'});

    return this.http.post<Issue[]>(`${environment.apiUrl}/issues/searches?sort=-updatedAt&include=creator&include=issueType&include=assignee`, queryObject, { headers: headers });
  }

  loadIssue(id: string): Observable<Issue>
  {
    return this.http.get<Issue>(`${environment.apiUrl}/issues/${id}`);
  }

  createIssue(issueReq: IssueNewRequest): Observable<Issue>
  {
    const headers = new HttpHeaders({ 'Content-type': 'application/json'});

    return this.http.post<Issue>(`${environment.apiUrl}/issues`, issueReq, { headers: headers });
  }

  updateIssue(id: string, issueReq: IssueNewRequest): Observable<Issue>
  {
    return this.http.patch<Issue>(`${environment.apiUrl}/issues/${id}`, issueReq);
  }

  deleteIssue(id: string): Observable<any>
  {
    return this.http.delete<any>(`${environment.apiUrl}/issues/${id}`);
  }

  initializeIssue(): Issue
  {
    return new Issue();
  }
}