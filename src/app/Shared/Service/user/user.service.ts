import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { of } from "rxjs";
import { switchMap } from 'rxjs/operators';
import { map } from "rxjs";
import { v4 } from "uuid";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private username: string | null = null;
  private baseURL = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  checkUserExists(email: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.baseURL}/usuarios`).pipe(
      map(users => users.some(user => user.email === email))
    );
  }

  login(email: string, password: string): Observable<any> {
    // Comprueba si el usuario existe
    return this.checkUserExists(email).pipe(
      switchMap((userExists: boolean) => {
        if (userExists) {
          // Usuario encontrado, ahora verifica la contraseña
          return this.http.get<any[]>(`${this.baseURL}/usuarios`, {
            params: {email},
          }).pipe(
            map((users: any[]) => {
              const user = users.find((u: any) => u.email === email);
              if (user.password === password) {
                // Contraseña correcta, devuelve el usuario
                return user;
              } else {
                // Contraseña incorrecta
                return null;
              }
            })
          );
        } else {
          // Usuario no encontrado
          return of(null);
        }
      })
    );
  }

  signup(email: string, password: string): Observable<any> {
    // Comprueba si el usuario existe antes de intentar registrarlo
    return this.checkUserExists(email).pipe(
      switchMap((userExists) => {
        if (userExists) {
          // Si el usuario ya existe, devuelve null u otra señal de que el registro falló
          return of(null);
        } else {
          // Genera un ID único para el nuevo usuario
          const userId = v4();
          const newUser = {
            id: userId,
            email,
            password
          };
          // Realiza el registro del nuevo usuario
          return this.http.post<any>(`${this.baseURL}/usuarios`, newUser);
        }
      })
    );
  }

  setUsername(username: string): void {
    this.username = username;
  }

  getUserId(): string | null {
    return this.username;
  }

  clearUser(): void {
    this.username = null;
  }
}
