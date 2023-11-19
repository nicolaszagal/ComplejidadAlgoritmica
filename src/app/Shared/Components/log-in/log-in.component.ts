import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService} from "../../Service/user/user.service";
import {AuthService} from "../../Service/Autenticacion/autenticacion.service";

@Component({
    selector: 'app-log-in',
    templateUrl: './log-in.component.html',
    styleUrls: ['./log-in.component.css'],
})
export class LogInComponent {
    email: string = '';
    password: string = '';
    loginError: boolean = false;

    constructor(private authService: UserService, private router: Router, private authGuardService: AuthService) {}

    login(): void {
        this.authService.login(this.email, this.password).subscribe(
            (user: any) => {
                if (user) {
                  console.log('Inicio de sesión exitoso');
                  this.router.navigate(['/home']);

                } else {
                    // Authentication failed, show an error message
                    this.loginError = true;
                    console.log('Credenciales incorrectas');
                }
            },
            (error) => {
                // Handle errors if necessary
                console.error('Error de inicio de sesión', error);
            }
        );
        this.authGuardService.login(this.email)
    }
}

