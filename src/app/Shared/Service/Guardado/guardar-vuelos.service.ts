import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid'; // Utilizamos la función correcta para generar UUID
import { VueloGuardado } from "../../../Flights/Models/vuelosGuardados";

@Injectable({
  providedIn: 'root',
})
export class GuardarVuelosService {
  private apiUrl = '/assets/db.json';

  constructor(private http: HttpClient) {}

  getVuelos(): Observable<VueloGuardado[]> {
    return this.getVuelosData().pipe(
      map((dbData) => dbData.guardados || [])
    );
  }

  addVuelo(vuelo: VueloGuardado): Observable<any> {
    vuelo.id = uuidv4(); // Generamos un nuevo ID al agregar un vuelo
    return this.updateDb('guardados', [...this.getDbData().guardados, vuelo]);
  }

  deleteVuelo(id: string): Observable<any> {
    const guardados = this.getDbData().guardados || [];
    const updatedGuardados = guardados.filter((vuelo: VueloGuardado) => vuelo.id !== id);

    return this.updateDb('guardados', updatedGuardados);
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
