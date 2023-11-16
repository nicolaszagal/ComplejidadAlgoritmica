import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vuelo } from "../../Models/vuelo.model";
import { Nodo, Grafo, Conexion } from "../../Models/grafo.model";

@Injectable({
  providedIn: 'root',
})
export class VuelosService {
  private vuelosUrl = 'http://localhost:3000/vuelos';
  private grafo: Grafo = {};

  constructor(private http: HttpClient) {
    this.getVuelos().subscribe(
      (vuelosData: Vuelo[]) => {
        this.construirGrafo(vuelosData);
      },
      error => {
        console.error('Error al cargar los vuelos: ', error);
      }
    );
  }

  getVuelos(): Observable<Vuelo[]> {
    return this.http.get<Vuelo[]>(this.vuelosUrl);
  }

  private construirGrafo(vuelosData: Vuelo[]): void {
    vuelosData.forEach(vuelo => {
      if (!this.grafo[vuelo.origen]) {
        this.grafo[vuelo.origen] = [];
      }
      const conexion: Conexion = {
        destino: vuelo.destino,
        distancia: vuelo.distancia,
      };
      this.grafo[vuelo.origen].push(conexion);
    });
  }

  calcularRuta(origen: string | null, destino: string | null): Vuelo[] | null {
    if (!origen || !destino) {
      return null;
    }

    const nodosAbiertos: Nodo[] = [{ ciudad: origen, costoTotal: Number.MAX_VALUE }];
    const nodosCerrados: Set<string> = new Set();

    while (nodosAbiertos.length > 0) {
      nodosAbiertos.sort((a, b) => a.costoTotal - b.costoTotal);
      const nodoActual = nodosAbiertos.shift()!;

      console.log('Nodo actual:', nodoActual);

      if (nodoActual.ciudad === destino) {
        console.log('Ruta encontrada!');
        const ruta: Vuelo[] = [];
        let vueloAnterior = nodoActual.vueloAnterior;
        while (vueloAnterior) {
          ruta.unshift(vueloAnterior);
          vueloAnterior = vueloAnterior.vueloAnterior;
        }
        return ruta;
      }

      console.log('Conexiones:', this.grafo[nodoActual.ciudad] || []);

      if (!nodosCerrados.has(nodoActual.ciudad)) {
        nodosCerrados.add(nodoActual.ciudad);

        const conexiones = this.grafo[nodoActual.ciudad] || [];
        for (const conexion of conexiones) {
          const nuevoNodo: Nodo = {
            ciudad: conexion.destino,
            costoTotal: nodoActual.costoTotal + conexion.distancia,
            vueloAnterior: {
              distancia: conexion.distancia,
              origen: nodoActual.ciudad,
              destino: conexion.destino,
            },
          };

          console.log('Nuevo nodo:', nuevoNodo);

          if (!nodosCerrados.has(nuevoNodo.ciudad)) {
            nodosAbiertos.push(nuevoNodo);
          }
        }
      }
    }

    console.log('No se encontró una ruta');
    return null;
  }
}
