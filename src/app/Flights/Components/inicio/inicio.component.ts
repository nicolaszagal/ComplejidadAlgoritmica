import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from "@angular/forms";
import { startWith, map, Observable } from "rxjs";
import { DestinosService } from "../../Services/Destinos/destinos.service";
import { VuelosService } from "../../Services/Vuelos/vuelos.service"

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
  costoTotal: number = 0;

  constructor(private destinosService: DestinosService, private vuelosService: VuelosService) {}

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
        this.costoTotal = costoTotal;
        this.rutaEncontrada = rutaCalculada;
        this.mostrarRuta = true;
      },
      (error: any) => {
        console.error('Error al calcular la ruta:', error);
      }
    );
  }
}
