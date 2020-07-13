import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { User } from 'src/app/models/user';
import { Issue } from 'src/app/models/issue';


@Injectable({
  providedIn: "root",
})
export class MeService
{
  constructor(private http: HttpClient) {}

  loadAllMyIssues(): Observable<Issue[]>
  {
    return this.http.get<Issue[]>(`${environment.apiUrl}/me/issues`);
  }

  loadMe(): Observable<User>
  {
    return this.http.get<User>(`${environment.apiUrl}/me`);
  }
}