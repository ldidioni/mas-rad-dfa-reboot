import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { User } from 'src/app/models/user';
import { map } from 'rxjs/operators';
import { RegistrationRequest } from 'src/app/models/registration-request';


@Injectable({
  providedIn: "root",
})
export class UserService
{
  constructor(private http: HttpClient) {}

  loadAllUsers(): Observable<User[]>
  {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  loadUser(id: number): Observable<User>
  {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  createUser(reg: RegistrationRequest): Observable<User>
  {
    const headers = new HttpHeaders({ 'Content-type': 'application/json'});

    return this.http.post<User>(`${environment.apiUrl}/users`, reg, { headers: headers });
  }

  updateUser(user: User): Observable<User>
  {
    const headers = new HttpHeaders({ 'Content-type': 'application/json'});

    return this.http.put<User>(`${environment.apiUrl}/users/${user.id}`, user, { headers: headers });
  }

  checkNameNotTaken(username: string): Observable<boolean>
  {
  return this.loadAllUsers()
    .pipe(
      map((users: User[]) => users.filter((user: User) => user.name === username)),
      map((users: User[]) => !users.length)
    )
  }
}