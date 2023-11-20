import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from "@angular/forms";
import { startWith, map, Observable } from "rxjs";
import { DestinosService } from "../../Services/Destinos/destinos.service";
import { VuelosService } from "../../Services/Vuelos/vuelos.service"
import { GuardarVuelosService } from "../../../Shared/Service/Guardado/guardar-vuelos.service";
import {VueloGuardado} from "../../Models/vuelosGuardados";

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
  rutaEncontradaVuelta: string[] = [];
  mostrarRuta: boolean = false;
  precioTotal: number = 0;
  mostrarPrecio: boolean = false;
  precioTotalFormatted: string = '';
  precioTotalVueltaFormatted: string = '';
  errorSeleccionTipoVuelo: string = '';
  errorCalculandoRuta: string = ''
  guardado: string = '';
  idaYVuelta: boolean = false;
  constructor(
    private destinosService: DestinosService,
    private vuelosService: VuelosService,
    private guardarService: GuardarVuelosService
  ) {}

  ngAfterViewInit() {
    this.obtenerDatosDestinos();
    this.vuelosService.buildGraph().subscribe(
      (graphData) => {
        console.log(graphData)
      },
      (error) => console.error('Error al construir el grafo: ', error)
    );
  }

  private obtenerDatosDestinos() {
    this.destinosService.getDestinos().subscribe(
      (destinosData: any) => {
        this.destinos = this.parseDestinosData(destinosData);
        this.configurarAutocompletado();
      },
      (error) => console.error('Error al obtener los destinos: ', error)
    );
  }

  private configurarAutocompletado() {
    this.filteredOptionsOrigen = this.setupAutocomplete(this.origenControl);
    this.filteredOptionsDestino = this.setupAutocomplete(this.destinoControl);
  }

  private setupAutocomplete(control: FormControl): Observable<string[]> {
    return control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.destinos))
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
    const origen = this.origenControl.value;
    const destino = this.destinoControl.value;

    // Restablecer variables antes de ejecutar
    this.mostrarRuta = false;
    this.mostrarPrecio = false;

    if (origen && destino) {
      const ruta = this.vuelosService.calculatorRuta(origen, destino);
      ruta.subscribe(
        (rutaCalculada: string[]) => {
          console.log('Ruta de ida encontrada:', rutaCalculada);
          this.rutaEncontrada = rutaCalculada;
          this.mostrarRuta = true;

          // Calcular ruta de vuelta si está habilitada
          if (this.idaYVuelta) {
            const rutaVuelta = this.vuelosService.calculatorRuta(destino, origen);
            rutaVuelta.subscribe(
              (rutaCalculadaVuelta: string[]) => {
                console.log('Ruta de vuelta encontrada:', rutaCalculadaVuelta);
                // Asignar la ruta de vuelta y mostrarla en el card
                this.rutaEncontradaVuelta = rutaCalculadaVuelta;
                this.mostrarRuta = true;

                // Obtener precio de la ruta de vuelta
                this.obtenerPrecioVuelta();
              },
              (error: any) => {
                console.error('Error al calcular la ruta de vuelta:', error);
                if (error && error.length === 0) {
                  this.errorCalculandoRuta = 'Aun no contamos con vuelos al destino seleccionado ';
                }
              }
            );
          } else {
            // Obtener precio de la ruta de ida si no hay vuelta
            this.obtenerPrecio();
          }
        },
        (error: any) => {
          console.error('Error al calcular la ruta de ida:', error);
          if (error && error.length === 0) {
            this.errorCalculandoRuta = 'Aun no contamos con vuelos al destino seleccionado ';
          }
        }
      );
    } else {
      console.error('Error: Debes seleccionar un origen y destino.');
    }
  }


  private mostrarError(mensaje: string): void {
    this.errorCalculandoRuta = mensaje;
    this.mostrarRuta = false;
    this.mostrarPrecio = false;
    this.precioTotal = 0;
    console.error(mensaje);
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

  obtenerPrecioVuelta(): void {
    const origen = this.destinoControl.value; // Origen ahora es el destino
    const destino = this.origenControl.value; // Destino ahora es el origen

    if (!this.selectedTipoVuelo) {
      this.errorSeleccionTipoVuelo = 'Error al obtener el precio: Debes seleccionar un tipo de vuelo.';
      return;
    }
    if (origen && destino) {
      this.vuelosService.getPrice(origen, destino).subscribe(
        (precioCalculado) => {
          console.log('Precio Total Vuelta:', precioCalculado);

          // Ajustar precio de la ruta de vuelta según el tipo de vuelo seleccionado
          if (this.selectedTipoVuelo !== 'Ejecutiva' && this.selectedTipoVuelo !== 'Lujo') {
            this.precioTotal = Math.round(precioCalculado);
          } else if (this.selectedTipoVuelo === 'Ejecutiva') {
            this.precioTotal = Math.round(precioCalculado * 1.15);
          } else if (this.selectedTipoVuelo === 'Lujo') {
            this.precioTotal = Math.round(precioCalculado * 1.30);
          }
          this.precioTotalVueltaFormatted = this.formatearPrecio(this.precioTotal);
          this.mostrarPrecio = true;
          this.errorSeleccionTipoVuelo = '';
        },
        (error) => {
          console.error('Error al obtener el precio de vuelta: ', error);
        }
      );
    } else {
      console.error('Error: Debes seleccionar un origen y destino.');
    }
  }

  private formatearPrecio(numero: number): string {
    return numero.toLocaleString('es-ES')
  }

  rutaYPrecio(): void {
    this.calcularRuta();
    this.obtenerPrecio();
  }

  guardarVuelo() {
    const vuelo: VueloGuardado = {
      id: '', // asigna el valor correcto según tu lógica
      vuelo: {
        ruta: this.rutaEncontrada,
        precio: this.precioTotal,
        tipoVuelo: this.selectedTipoVuelo,
      },
      userId: '', // asigna el valor correcto según tu lógica
    };

    this.guardarService.addVuelo(vuelo).subscribe(
      (response) => this.guardado = 'Vuelo guardado con éxito!',
      (error) => this.guardado = 'Error al guardar el vuelo :('
    );
  }

}
