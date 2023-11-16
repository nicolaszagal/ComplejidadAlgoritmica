export interface Vuelo {
  distancia: number;
  origen: string;
  destino: string;
  vueloAnterior?: Vuelo;
}
