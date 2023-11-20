import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { v4 } from "uuid";
import { AuthService } from "../Autenticacion/autenticacion.service";

@Injectable({
  providedIn: 'root'
})
export class GuardarVuelosService {

  private apiUrl = 'http://localhost:3000/guardados';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getVuelos(): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.get<any>(`${this.apiUrl}?userId=${userId}`);
  }

  addVuelo(vuelo: any): Observable<any>{
    const rutaId = v4();
    const userId = this.authService.getUserId();
    const vueloGuardado = { id : rutaId, vuelo, userId };
    return this.http.post<any>(this.apiUrl, vueloGuardado);
  }

  deleteVuelo(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<any>(url);
  }
}
