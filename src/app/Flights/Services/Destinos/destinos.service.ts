import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DestinosService {

  private destinosUrl = window.location.hostname === 'production' ? 'https://incredible-sunburst-a91e6b.netlify.app/api/destinos':'http://localhost:3000/';
  constructor(private http: HttpClient) { }

  getDestinos(): Observable<any[]> {
    return this.http.get<any[]>(this.destinosUrl).pipe(
        catchError(error => {
          console.error('Error al obtener los destinos desde el servicio: ', error);
          return [];
        })
    );
  }
}
