export interface GraphNode {
  ciudad: string;
}

export interface GraphEdge{
  origen: string,
  destino: string,
  peso: number // Division entre distancia y costo.
}
