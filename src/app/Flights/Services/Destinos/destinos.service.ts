import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DestinosService {
  private apiUrl = '/assets/db.json';

  constructor(private http: HttpClient) {}

  getDestinos(): Observable<any[]> {
    return this.getDestinosData().pipe(
      map((dbData) => dbData.destinos),
      catchError((error) => {
        console.error('Error al obtener los destinos desde el servicio: ', error);
        return [];
      })
    );
  }

  private getDestinosData(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
