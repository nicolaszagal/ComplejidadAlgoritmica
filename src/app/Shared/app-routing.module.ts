import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {InicioComponent} from "../Flights/Components/inicio/inicio.component";
import {MyFlightsComponent} from "../Flights/Components/my-flights/my-flights.component";
import {LogInComponent} from "./Components/log-in/log-in.component";
import {SignUpComponent} from "./Components/sign-up/sign-up.component";
import { AuthGuard} from "./Service/Autenticacion/auth.guard";

const routes: Routes = [
  {path: 'login', component: LogInComponent },
  {path: 'signup', component: SignUpComponent},
  {path: 'home', component: InicioComponent, canActivate: [AuthGuard]},
  {path: 'my-flights', component: MyFlightsComponent, canActivate: [AuthGuard]},
  {path: '**', pathMatch: 'full', redirectTo: 'login'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
