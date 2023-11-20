export interface VueloGuardado {
  id: string;
  vuelo: {
    ruta: string[];
    precio: number;
    tipoVuelo: string;
  };
  userId: string;
}
