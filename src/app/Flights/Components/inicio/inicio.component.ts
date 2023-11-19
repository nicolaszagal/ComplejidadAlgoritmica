import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from "@angular/forms";
import { startWith, map, Observable } from "rxjs";
import { DestinosService } from "../../Services/Destinos/destinos.service";
import { VuelosService } from "../../Services/Vuelos/vuelos.service"
import { GuardarVuelosService } from "../../../Shared/Service/Guardado/guardar-vuelos.service";

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent implements AfterViewInit {
  @ViewChild('inputOrigen') inputOrigen!: ElementRef<HTMLInputElement>;
  @ViewChild('inputDestino') inputDestino!: ElementRef<HTMLInputElement>;
  origenControl = new FormControl('');
  destinoControl = new FormControl('');
  destinos: string[] = [];
  filteredOptionsOrigen!: Observable<string[]>;
  filteredOptionsDestino!: Observable<string[]>;
  tiposVuelo = ['Turista', 'Ejecutiva', 'Lujo'];
  selectedTipoVuelo: string = '';
  rutaEncontrada: string[] = [];
  mostrarRuta: boolean = false;
  precioTotal: number = 0;
  mostrarPrecio: boolean = false;
  precioTotalFormatted: string = '';
  errorSeleccionTipoVuelo: string = '';
  guardado: string = '';

  constructor(private destinosService: DestinosService, private vuelosService: VuelosService, private guardarService: GuardarVuelosService) {}

  ngAfterViewInit() {
    // Obtener datos de destinos desde el servicio
    this.destinosService.getDestinos().subscribe(
        (destinosData: any) => {
          this.destinos = this.parseDestinosData(destinosData);

          // Configurar autocompletado para el campo de origen
          this.filteredOptionsOrigen = this.origenControl.valueChanges.pipe(
              startWith(''),
              map(value => this._filter(value || '', this.destinos))
          );

          // Configurar autocompletado para el campo de destino
          this.filteredOptionsDestino = this.destinoControl.valueChanges.pipe(
              startWith(''),
              map(value => this._filter(value || '', this.destinos))
          );
        },
        error => {
          console.error('Error al obtener los destinos: ', error);
        }
    );
    this.vuelosService.buildGraph().subscribe(
      (graphData) => {},
      (error) => {
        console.error('Error al construir el grafo: ', error);
      }
    );

  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  private parseDestinosData(destinosData: any): string[] {
    if (!destinosData || !Array.isArray(destinosData)) {
      return [];
    }

    return destinosData.map(entry => {
      const ciudad = this.capitalize(entry.ciudad);
      const pais = this.capitalize(entry.pais);
      return `${ciudad}, ${pais}`;
    });
  }

  private capitalize(str: string): string {
    if (str === undefined || str === null) {
      return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  trackByFn(index: number, item: string): number {
    return index;
  }

  calcularRuta(): void {
    const ruta = this.vuelosService.calculatorRuta(this.origenControl.value, this.destinoControl.value);
    ruta.subscribe(
      (rutaCalculada: string[]) => {
        console.log('Ruta encontrada:', rutaCalculada);
        this.rutaEncontrada = rutaCalculada;
        this.mostrarRuta = true;
        this.mostrarPrecio = false; // Asegúrate de establecer mostrarPrecio en false aquí o en otro lugar si es necesario
      },
      (error: any) => {
        console.error('Error al calcular la ruta:', error);
      }
    );
  }

  obtenerPrecio(): void {
    const origen = this.origenControl.value;
    const destino = this.destinoControl.value;

    if (!this.selectedTipoVuelo) {
     this.errorSeleccionTipoVuelo = 'Error al obtener el precio: Debes seleccionar un tipo de vuelo.';
      return;
    }
    if (origen && destino) {
      this.vuelosService.getPrice(origen, destino).subscribe(
        (precioCalculado) => {
          console.log('Precio Total:', precioCalculado);

          if (this.selectedTipoVuelo !== 'Ejecutiva' && this.selectedTipoVuelo !== 'Lujo') {
            this.precioTotal = Math.round(precioCalculado);
          } else if (this.selectedTipoVuelo === 'Ejecutiva') {
            this.precioTotal = Math.round(precioCalculado * 1.15);
          } else if (this.selectedTipoVuelo === 'Lujo') {
            this.precioTotal = Math.round(precioCalculado * 1.30);
          }
          this.precioTotalFormatted = this.formatearPrecio(this.precioTotal);
          this.mostrarPrecio = true;
          this.errorSeleccionTipoVuelo = '';
        },
        (error) => {
          console.error('Error al obtener el precio: ', error);
        }
      );
    } else {
      console.error('Error: Debes seleccionar un origen y destino.');
    }
  }

  private formatearPrecio(numero: number): string{
    return numero.toLocaleString('es-ES')
  }

  rutaYPrecio(): void{
    this.calcularRuta();
    this.obtenerPrecio();
  }

  guardarVuelo(){
    const vuelo = {
      ruta: this.rutaEncontrada,
      precio: this.precioTotal,
      tipoVuelo: this.selectedTipoVuelo,
    };

    this.guardarService.addVuelo(vuelo).subscribe(
      (response) => {
        this.guardado = 'Vuelo guardado con éxito!';
      },
      (error) => {
        this.guardado = 'Error al guardar el vuelo :(';
      }
    )
  }
}
