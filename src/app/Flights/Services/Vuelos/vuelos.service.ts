import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { GraphNode, GraphEdge } from '../../Models/grafo.model';

@Injectable({
  providedIn: 'root',
})
export class VuelosService {
  private apiUrl = 'http://localhost:3000/vuelos';

  constructor(private http: HttpClient) {}

  getGraphData(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  buildGraph(): Observable<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    return this.getGraphData().pipe(
      map((vuelosData: any) => {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];

        vuelosData.forEach((vuelo: any) => {
          const origenNode: GraphNode = { ciudad: vuelo.origen };
          const destinoNode: GraphNode = { ciudad: vuelo.destino };

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

        const graphData = { nodes, edges };
        console.log('Graph Data:', graphData);

        return graphData;
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

  calculatorRuta(origen: string | null, destino: string | null): string[] {
    console.log(origen, "-", destino)
    const conjuntoAbierto: string[] = [origen || ''];
    const vinoDesde: { [key: string]: string } = {};
    const costoReal: { [key: string]: number } = {};
    const costoEstimado: { [key: string]: number } = {};
    let edges: GraphEdge[] = []; // Agregamos esta línea

    // Obtener las aristas del grafo
    this.buildGraph().subscribe((graph) => {
      edges = graph.edges;
    });

    costoReal[origen || ''] = 0;
    costoEstimado[origen || ''] = this.heuristic({ ciudad: origen || '' }, { ciudad: destino || '' });

    while (conjuntoAbierto.length > 0) {
      const actual = conjuntoAbierto.reduce((minNode, node) =>
        costoEstimado[node] < costoEstimado[minNode] ? node : minNode
      );

      if (actual === destino) {
        return this.reconstruirRuta(vinoDesde, actual);
      }

      conjuntoAbierto.splice(conjuntoAbierto.indexOf(actual), 1);

      const edgeActual = edges.filter((edge) => edge.origen === actual);

      edgeActual.forEach((edge) => {
        const vecino = edge.destino;
        const costoRealTentativo = costoReal[actual] + edge.peso;

        if (!costoReal[vecino] || costoRealTentativo < costoReal[vecino]) {
          vinoDesde[vecino] = actual;
          costoReal[vecino] = costoRealTentativo;
          costoEstimado[vecino] = costoReal[vecino] + this.heuristic(
            { ciudad: vecino },
            { ciudad: destino || '' }
          );

          if (!conjuntoAbierto.includes(vecino)) {
            conjuntoAbierto.push(vecino);
          }
        }
      });
    }

    return [];
  }
}
