import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {v4} from "uuid";

@Injectable({
  providedIn: 'root'
})
export class GuardarVuelosService {

  private apiUrl = 'http://localhost:3000/guardados';
  constructor(private http: HttpClient) { }

  getVuelos(): Observable<any[]>{
    return this.http.get<any[]>(this.apiUrl);
  }

  addVuelo(vuelo: any): Observable<any>{
    const rutaId = v4();
    const vueloGuardado = {
      id : rutaId,
      vuelo
    }
    return this.http.post<any>(this.apiUrl, vueloGuardado);
  }

  deleteVuelo(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<any>(url);
  }

}
