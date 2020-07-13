import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IssueType } from "src/app/models/issue-type";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class IssueTypeService {
  constructor(private http: HttpClient) {}

  loadAllIssueTypes(): Observable<IssueType[]>
  {
    return this.http.get<IssueType[]>(`${environment.apiUrl}/issueTypes`);
  }
}
