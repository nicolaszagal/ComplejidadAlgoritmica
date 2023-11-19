import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {UserService} from "../user/user.service";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  constructor(private userService: UserService) {}

  login(username: string): void {
    this.loggedIn.next(true);
    this.userService.setUsername(username);
  }

  logout(): void {
    this.loggedIn.next(false);
    this.userService.clearUser();
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

}
