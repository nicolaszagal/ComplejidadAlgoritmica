import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable, switchMap} from 'rxjs';
import { GraphNode, GraphEdge } from '../../Models/grafo.model';

@Injectable({
  providedIn: 'root',
})
export class VuelosService {
  private apiUrl = 'http://localhost:3000/vuelos';
  private graph: { nodes: GraphNode[]; edges: GraphEdge[] } = {nodes: [], edges: []};

  constructor(private http: HttpClient) {
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

  buildGraph(): Observable<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    return this.getGraphData().pipe(
      map((vuelosData: any) => {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];

        vuelosData.forEach((vuelo: any) => {
          const origenNode: GraphNode = {ciudad: vuelo.origen};
          const destinoNode: GraphNode = {ciudad: vuelo.destino};

          if (!nodes.some((node) => node.ciudad === origenNode.ciudad)) {
            nodes.push(origenNode);
          }
          if (!nodes.some((node) => node.ciudad === destinoNode.ciudad)) {
            nodes.push(destinoNode);
          }

          const costo = vuelo.costo || 1;

          const peso = costo !== 0 ? vuelo.distancia / costo : 0;

          const edge: GraphEdge = {
            origen: origenNode.ciudad,
            destino: destinoNode.ciudad,
            peso: peso,
          };
          edges.push(edge);
        });

        return {nodes, edges};
      })
    );
  }

  heuristic(node: GraphNode, goal: GraphNode): number {
    return Math.abs(node.ciudad.length - goal.ciudad.length);
  }

  reconstruirRuta(vinoDesde: { [key: string]: string }, actual: string): string[] {
    const rutaTotal: string[] = [actual];
    while (vinoDesde[actual]) {
      actual = vinoDesde[actual];
      rutaTotal.unshift(actual);
    }
    return rutaTotal;
  }

  calculatorRuta(origen: string | null, destino: string | null): Observable<string[]> {
    return new Observable<string[]>((observer) => {
      let conjuntoAbierto: string[] = [origen || ''];
      const vinoDesde: { [key: string]: string } = {};
      const costoReal: { [key: string]: number } = {};
      const costoEstimado: { [key: string]: number } = {};
      let graph: { edges: GraphEdge[] } = {edges: []};
      let nodosVecinos: { [key: string]: string[] } = {};

      this.buildGraph().subscribe((graphData) => {
        graph = graphData;

        graph.edges.forEach((edge) => {
          if (!nodosVecinos[edge.origen]) {
            nodosVecinos[edge.origen] = [];
          }
          nodosVecinos[edge.origen].push(edge.destino);
        });
        const formatCiudad = (ciudad: string | null): string => {
          return ciudad ? ciudad.toUpperCase().replace(/,/, '') : '';
        };

        const origenFormatted = formatCiudad(origen);
        const destinoFormatted = formatCiudad(destino);

        costoReal[origenFormatted || ''] = 0;
        costoEstimado[origenFormatted || ''] = this.heuristic({ciudad: origenFormatted || ''}, {ciudad: destinoFormatted || ''});

        const recursiveAlgorithm = (actual: string) => {
          if (conjuntoAbierto.length === 0) {
            console.log('No se encontró una ruta');
            observer.next([]);
            observer.complete();
            return;
          }

          const actualFormatted = formatCiudad(actual);

          const vecinos = nodosVecinos[actualFormatted] || [];
          console.log("Nodos vecinos:", vecinos);

          vecinos.forEach((vecino) => {
            if (vecino === destinoFormatted) {
              const edge = graph.edges.find((e) => e.origen === actualFormatted && e.destino === vecino);
              console.log(edge)

              // Verificar si existe el edge
              if (edge) {
                const costoRealTentativo = costoReal[actualFormatted] + edge.peso;

                if (!costoReal[vecino] || costoRealTentativo < costoReal[vecino]) {
                  vinoDesde[vecino] = actualFormatted;
                  costoReal[vecino] = costoRealTentativo;
                  costoEstimado[vecino] = costoReal[vecino] + this.heuristic(
                    { ciudad: vecino },
                    { ciudad: destino || '' }
                  );

                  if (!conjuntoAbierto.includes(vecino)) {
                    conjuntoAbierto.push(vecino);
                    console.log(conjuntoAbierto)
                  }
                }
              }
            }
          });
          //Apartir de aca esta el problema. No esta recorriendo los nodos, ya halló los vecinos, pero no los recorre

          conjuntoAbierto.splice(conjuntoAbierto.indexOf(actualFormatted), 1);

          if (actualFormatted === destino) {
            console.log('Ruta encontrada!');
            observer.next(this.reconstruirRuta(vinoDesde, actualFormatted));
            observer.complete();
            return;
          }


          // Encontrar el próximo nodo con el costo estimado más bajo
          const nuevoActual = conjuntoAbierto.length > 0 ? conjuntoAbierto.reduce((minNode, node) => {
            return costoEstimado[node] < costoEstimado[minNode] ? node : minNode;
          }, '') : '';

          // Llamada recursiva después de procesar un nodo
          recursiveAlgorithm(nuevoActual);
        };

        // Algoritmo de inicialización
        recursiveAlgorithm(origen || '');
      });
    });
  }
}
