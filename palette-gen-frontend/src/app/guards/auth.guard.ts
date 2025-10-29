import { KeycloakService } from './../services/keycloak/keycloak.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private keycloakService: KeycloakService,
              private router: Router) {}

  canActivate(): boolean {
    if (this.keycloakService.keycloak.isTokenExpired()) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }

}

