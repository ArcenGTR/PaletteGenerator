import { inject } from "@angular/core";
import { KeycloakService } from "./services/keycloak/keycloak.service";

export function initializeKeycloak() {
    const keycloakService = inject(KeycloakService);
    //console.log('APP_INITIALIZER factory function called');
    return keycloakService.init();
}