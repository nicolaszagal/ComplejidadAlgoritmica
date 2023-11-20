import { Component, OnInit } from '@angular/core';
import { GuardarVuelosService } from "../../../Shared/Service/Guardado/guardar-vuelos.service";

@Component({
  selector: 'app-my-flights',
  templateUrl: './my-flights.component.html',
  styleUrls: ['./my-flights.component.css']
})
export class MyFlightsComponent implements OnInit {
  vuelos: any[] = [];
  errorObtenerVuelos: string = '';
  errorEliminarVuelo: string = '';

  constructor(private guardarService: GuardarVuelosService) { }

  ngOnInit() {
    this.obtenerVuelos();
  }

  obtenerVuelos() {
    this.guardarService.getVuelos().subscribe(
      (vuelos: any[]) => {
        this.vuelos = vuelos;
        this.errorObtenerVuelos = ''; // Limpiar mensaje de error en éxito
      },
      (error) => {
        console.error('Error al obtener vuelos guardados:', error);
        this.errorObtenerVuelos = 'Error al obtener vuelos guardados.';
      }
    );
  }

  eliminarVuelo(id: string) {
    this.guardarService.deleteVuelo(id).subscribe(
      () => {
        console.log('Vuelo eliminado con éxito.');
        this.obtenerVuelos();
        this.errorEliminarVuelo = ''; // Limpiar mensaje de error en éxito
      },
      (error) => {
        console.error('Error al eliminar el vuelo:', error);
        this.errorEliminarVuelo = 'Error al eliminar el vuelo.';
      }
    );
  }
}

