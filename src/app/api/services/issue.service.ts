import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { Issue } from "src/app/models/issue";
import { environment } from "../../../environments/environment";
import { IssueNewRequest } from 'src/app/models/issue-new-request';
import { mergeMap, map } from 'rxjs/operators';


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

  getTotalNumberOfPages(): Observable<number>
  {
    return this.http.get(`${environment.apiUrl}/issues`, { observe: 'response' })
    .pipe(map(response => Math.ceil(parseInt(response.headers.get('Pagination-Total')) / 20)));
  }

  loadIssuesWithDetailsForPageOfIndex(index: number): Observable<Issue[]>
  {
    return this.http.get<Issue[]>(`${environment.apiUrl}/issues?page=${index}&include=creator&include=issueType&include=assignee`);
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

  searchGetTotalNumberOfPages(queryObject: any): Observable<number>
  {
    const headers = new HttpHeaders({ 'Content-type': 'application/json'});

    return this.http.post<Issue[]>(
        `${environment.apiUrl}/issues/searches?sort=-updatedAt&include=creator&include=issueType&include=assignee`,
        queryObject,
        { headers: headers, observe: 'response' })
      .pipe(map(response => Math.ceil(parseInt(response.headers.get('Pagination-Total')) / 20)));
  }

  searchIssuesForPageOfIndex(queryObject: any, index: number): Observable<Issue[]>
  {
    const headers = new HttpHeaders({ 'Content-type': 'application/json'});

    return this.http.post<Issue[]>(`${environment.apiUrl}/issues/searches?page=${index}&sort=-updatedAt&include=creator&include=issueType&include=assignee`, queryObject, { headers: headers });
  }

  loadIssueWithDetails(id: string): Observable<Issue>
  {
    return this.http.get<Issue>(`${environment.apiUrl}/issues/${id}?include=creator&include=issueType&include=assignee`);
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