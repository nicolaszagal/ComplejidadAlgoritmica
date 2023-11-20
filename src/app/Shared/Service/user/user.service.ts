import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { switchMap, map } from 'rxjs/operators';
import { v4 } from "uuid";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseURL = window.location.hostname === 'production' ? 'https://incredible-sunburst-a91e6b.netlify.app/api/':'http://localhost:3000/';

  constructor(private http: HttpClient) {  }

  checkUserExists(email: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.baseURL}/usuarios`).pipe(
      map(users => users.some(user => user.email === email))
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.checkUserExists(email).pipe(
      switchMap((userExists: boolean) => {
        if (userExists) {
          return this.http.get<any[]>(`${this.baseURL}/usuarios`, {
            params: { email },
          }).pipe(
            map((users: any[]) => {
              const user = users.find((u: any) => u.email === email);
              return user && user.password === password ? user : null;
            })
          );
        } else {
          return of(null);
        }
      })
    );
  }

  signup(email: string, password: string): Observable<any> {
    return this.checkUserExists(email).pipe(
      switchMap((userExists) => {
        if (userExists) {
          return of(null);
        } else {
          const userId = v4();
          const newUser = { id: userId, email, password };
          return this.http.post<any>(`${this.baseURL}/usuarios`, newUser);
        }
      })
    );
  }
}
