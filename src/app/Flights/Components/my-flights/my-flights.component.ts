import { Component, OnInit } from '@angular/core';
import { GuardarVuelosService } from "../../../Shared/Service/Guardado/guardar-vuelos.service";

@Component({
  selector: 'app-my-flights',
  templateUrl: './my-flights.component.html',
  styleUrls: ['./my-flights.component.css']
})
export class MyFlightsComponent implements OnInit {
  vuelos: any[] = [];

  constructor(private guardarService: GuardarVuelosService) { }

  ngOnInit() {
    this.obtenerVuelos();
  }

  obtenerVuelos() {
    this.guardarService.getVuelos().subscribe(
      (vuelos: any[]) => this.vuelos = vuelos,
      (error) => console.error('Error al obtener vuelos guardados:', error)
    );
  }

  eliminarVuelo(id: string) {
    this.guardarService.deleteVuelo(id).subscribe(
      () => {
        console.log('Vuelo eliminado con éxito.');
        this.obtenerVuelos();
      },
      (error) => console.error('Error al eliminar el vuelo:', error)
    );
  }
}
