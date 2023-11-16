import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {InicioComponent} from "../Flights/Components/inicio/inicio.component";
import {MyFlightsComponent} from "../Flights/Components/my-flights/my-flights.component";

const routes: Routes = [
  {path: 'home', component: InicioComponent},
  {path: 'my-flights', component: MyFlightsComponent},
  {path: '**', pathMatch: 'full', redirectTo: 'home'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
