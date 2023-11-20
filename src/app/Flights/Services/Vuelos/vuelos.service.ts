import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as graphlib from 'graphlib';
import { Graph, Path } from 'graphlib';
import { AuthService } from "../../../Shared/Service/Autenticacion/autenticacion.service";

@Injectable({
  providedIn: 'root',
})
export class VuelosService {
  private apiUrl = 'http://localhost:3000/vuelos';
  private graph: Graph = new graphlib.Graph();
  private factor: number = 1;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.buildGraph().subscribe(
      (graphData) => this.graph = graphData,
      (error) => console.error('Error al construir el grafo: ', error)
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
          const { origen, destino } = vuelo;
          if(vuelo.distancia < 4000){
            this.factor = 0.15
          } else if (vuelo.distancia < 6000){
            this.factor = 0.35
          }else{
            this.factor = 0.40
          }
          const peso = vuelo.costo * this.factor;

          graph.setEdge(origen, destino, peso);
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

    return new Observable<string[]>((observer) => {
      if (!origenFormatted || !destinoFormatted) {
        observer.error('Error: Debes seleccionar un origen y destino.');
        return;
      }

      const dijkstraResult = graphlib.alg.dijkstra(this.graph, origenFormatted);

      if (!dijkstraResult[destinoFormatted]) {
        console.log('No se encontró una ruta');
        observer.error('Aun no contamos con vuelos al destino seleccionado');
        return;
      }

      const ruta = this.reconstruirRuta(dijkstraResult, destinoFormatted);
      console.log('Ruta encontrada:', ruta);
      observer.next(ruta);
      observer.complete();
    });
  }


  getPrice(origen: string | null, destino: string | null): Observable<number> {
    return this.calculatorRuta(origen, destino).pipe(
      map((ruta) => (ruta.length === 0 ? 0 : this.calcularCostoTotal(ruta)))
    );
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
}
