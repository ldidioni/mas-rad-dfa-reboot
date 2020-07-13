import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { IssueAction } from 'src/app/models/issue-action';


@Injectable({
  providedIn: "root",
})
export class IssueActionService
{
  constructor(private http: HttpClient) {}

  loadAllActions(): Observable<IssueAction[]>
  {
    return this.http.get<IssueAction[]>(`${environment.apiUrl}/actions`);
  }

  loadAction(id: number): Observable<IssueAction>
  {
    return this.http.get<IssueAction>(`${environment.apiUrl}/actions/${id}`);
  }
}