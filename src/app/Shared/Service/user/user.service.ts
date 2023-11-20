import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import {switchMap, map, catchError} from 'rxjs/operators';
import { v4 } from "uuid";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/assets/db.json';

  constructor(private http: HttpClient) {}

  checkUserExists(email: string): Observable<boolean> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((data) => data.usuarios.some((user: any) => user.email === email))
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      switchMap((data) => {
        const user = data.usuarios.find((u: any) => u.email === email);
        return of(user && user.password === password ? user : null);
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
          return this.updateDb('usuarios', [...this.getDbData().usuarios, newUser]);
        }
      })
    );
  }

  private getDbData(): any {
    return {};
  }

  private updateDb(key: string, newData: any): Observable<any> {
    const dbData = this.getDbData();
    dbData[key] = newData;

    return this.http.post(this.apiUrl, dbData).pipe(
      switchMap(() => of(newData)),
      catchError((error) => {
        console.error('Error updating database:', error);
        return of(null);
      })
    );
  }
}

