export interface Vuelo {
  distancia: number;
  origen: string;
  destino: string;
  costo: number;
  vueloAnterior?: Vuelo;
}
