import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import * as graphlib from 'graphlib';
import { Graph, Path } from 'graphlib';
import {AuthService} from "../../../Shared/Service/Autenticacion/autenticacion.service";

@Injectable({
  providedIn: 'root',
})
export class VuelosService {
  private apiUrl = 'http://localhost:3000/vuelos';
  private graph: Graph = new graphlib.Graph();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.buildGraph().subscribe(
      (graphData) => {
        this.graph = graphData;
      },
      (error) => {
        console.error('Error al construir el grafo: ', error);
      }
    );
  }

  getGraphData(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  buildGraph(): Observable<Graph> {
    return this.getGraphData().pipe(
      map((vuelosData: any) => {
        const graph = new graphlib.Graph();
        vuelosData.forEach((vuelo: any) => {
          const origenNode = vuelo.origen;
          const destinoNode = vuelo.destino;
          const costo = vuelo.costo || 1;
          const peso = costo !== 0 ? vuelo.distancia / costo : 0;

          graph.setEdge(origenNode, destinoNode, peso);
        });

        return graph;
      })
    );
  }

  reconstruirRuta(vinoDesde: { [node: string]: Path }, actual: string): string[] {
    const rutaTotal: string[] = [actual];
    while (vinoDesde[actual] && vinoDesde[actual].predecessor) {
      actual = vinoDesde[actual].predecessor;
      rutaTotal.unshift(actual);
    }
    return rutaTotal;
  }

  calculatorRuta(origen: string | null, destino: string | null): Observable<string[]> {
    const origenFormatted = origen?.toUpperCase().replace(/,/,'');
    const destinoFormatted = destino?.toUpperCase().replace(/,/,'');
    console.log(origenFormatted, "-", destinoFormatted)
    console.log(this.graph)
    return new Observable<string[]>((observer) => {
      if (!origenFormatted || !destinoFormatted) {
        observer.next([]);
        observer.complete();
        return;
      }

      const dijkstraResult = graphlib.alg.dijkstra(this.graph, origenFormatted);

      if (!dijkstraResult[destinoFormatted]) {
        console.log('No se encontró una ruta');
        observer.next([]);
        observer.complete();
        return;
      }

      const ruta = this.reconstruirRuta(dijkstraResult, destinoFormatted);
      console.log('Ruta encontrada:', ruta);
      observer.next(ruta);
      observer.complete();
    });
  }

  getPrice(origen: string | null, destino: string | null): Observable<number> {
    return new Observable<number>((observer) => {
      this.calculatorRuta(origen, destino).subscribe(
        (ruta) => {
          if (ruta.length === 0) {
            observer.next(0);
          } else {
            const costoTotal = this.calcularCostoTotal(ruta);
            observer.next(costoTotal);
          }
          observer.complete();
        },
        (error) => {
          console.error('Error al obtener el precio: ', error);
          observer.error(error);
        }
      );
    });
  }

  private calcularCostoTotal(ruta: string[]): number {
    let costoTotal = 0;
    for (let i = 0; i < ruta.length - 1; i++) {
      const origen = ruta[i];
      const destino = ruta[i + 1];
      const edge = this.graph.edge(origen, destino);
      if (edge) {
        costoTotal += edge;
      }
    }
    return costoTotal;
  }

  /*guardarVuelo(vuelo: any): Observable<any> {
    const userId = this.authService.getUserId();
    const vueloGuardado = { ...vuelo, userId };

    return this.http.post<any>(this.apiUrl, vueloGuardado);
  }*/
}
