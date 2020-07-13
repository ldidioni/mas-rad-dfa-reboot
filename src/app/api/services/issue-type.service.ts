import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IssueType } from "src/app/models/issue-type";
import { environment } from "../../../environments/environment";


@Injectable({
  providedIn: "root",
})
export class IssueTypeService
{
  constructor(private http: HttpClient) {}

  loadAllIssueTypes(): Observable<IssueType[]>
  {
    return this.http.get<IssueType[]>(`${environment.apiUrl}/issueTypes`);
  }

  loadIssueType(id: number): Observable<IssueType>
  {
    return this.http.get<IssueType>(`${environment.apiUrl}/issueTypes/${id}`);
  }

  createIssueType(issueType: IssueType): Observable<IssueType>
  {
    return this.http.post<IssueType>(`${environment.apiUrl}/issueTypes`, issueType);
  }

  updateIssueType(issueType: IssueType): Observable<IssueType>
  {
    return this.http.patch<IssueType>(`${environment.apiUrl}/issueTypes/${issueType.id}`, issueType);
  }
}