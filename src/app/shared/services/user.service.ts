import {inject, Injectable} from '@angular/core';
import {map, Observable} from "rxjs";
import {User} from "../models/users.model";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:3000';

  private http = inject(HttpClient)

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User[]>(`${this.baseUrl}/users?email=${encodeURIComponent(email)}`).pipe(
      map(users => users[0])
    );
  }

  isEmailUnique(email: string): Observable<boolean> {
    return this.http.get<User[]>(`${this.baseUrl}/users?email=${encodeURIComponent(email)}`)
      .pipe(map(users => users.length === 0));
  }

  createUser(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, {email, password});
  }
}
