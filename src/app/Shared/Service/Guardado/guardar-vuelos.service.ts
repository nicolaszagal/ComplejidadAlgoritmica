import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { v4 } from 'uuid';
import { AuthService } from '../Autenticacion/autenticacion.service';
import { map } from 'rxjs/operators';
import {VueloGuardado} from "../../../Flights/Models/vuelosGuardados";

@Injectable({
  providedIn: 'root',
})
export class GuardarVuelosService {
  private apiUrl = '/assets/db.json';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getVuelos(): Observable<VueloGuardado[]> {
    const userId = this.authService.getUserId();
    return this.getVuelosData().pipe(
      map((dbData) => dbData.guardados.filter((vueloGuardado: VueloGuardado) => vueloGuardado.userId === userId))
    );
  }

  addVuelo(vuelo: VueloGuardado): Observable<any> {
    const rutaId = v4();
    const userId = this.authService.getUserId();
    const vueloGuardado: VueloGuardado = { id: rutaId, vuelo: vuelo.vuelo, userId: vuelo.userId };
    return this.updateDb('guardados', [...this.getDbData().guardados, vueloGuardado]);
  }

  deleteVuelo(id: string): Observable<any> {
    const guardados = this.getDbData().guardados.filter((vueloGuardado: VueloGuardado) => vueloGuardado.id !== id);
    return this.updateDb('guardados', guardados);
  }

  private getVuelosData(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  private getDbData(): any {
    return {};
  }

  private updateDb(key: string, newData: any): Observable<any> {
    const dbData = this.getDbData();
    dbData[key] = newData;
    return this.http.put(this.apiUrl, dbData);
  }
}

