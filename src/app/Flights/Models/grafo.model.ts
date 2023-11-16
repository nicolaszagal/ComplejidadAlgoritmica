import { Vuelo } from "./vuelo.model";

export interface Grafo {
  [ciudad: string]: Conexion[];
}

export interface Nodo {
  ciudad: string;
  costoTotal: number;
  vueloAnterior?: Vuelo;
}

export interface Conexion {
  destino: string;
  distancia: number;
}
