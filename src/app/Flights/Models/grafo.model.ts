export interface Nodo {
    ciudad: string;
    costoTotal: number;
    vueloAnterior?:Vuelo;
}

export interface Vuelo {
    origen: string;
    distancia: number;
    destino: string;
    vueloAnterior?: Vuelo
}

export interface Grafo {
    [ciudad: string]: Vuelo[];
}

