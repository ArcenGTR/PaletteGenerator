import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
import { UserProfile } from './userProfile';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {

  private _keycloak: Keycloak | undefined;
  private _profile: UserProfile | undefined; 

  get keycloak() {
    if (!this._keycloak) {
      this._keycloak = new Keycloak({
        url: environment.KEYCLOAK_URL,
        realm: 'palette-gen-realm',
        clientId: 'palette-gen-client'
      });
    }

    return this._keycloak;
  }

  get profile(): UserProfile | undefined {
    return this._profile;
  }

  constructor() { }

  async init(): Promise<void> {
    const authenticated = await this.keycloak.init({
      onLoad: 'check-sso'
    });

    if (authenticated) {
      this._profile = await this.keycloak.loadUserProfile() as UserProfile;
      this._profile.token = this.keycloak.token;
    }
  }

  async getValidToken(): Promise<string | undefined> {
    if (!this.keycloak) {
      return undefined;
    }

    try {
      await this.keycloak.updateToken(30);
      return this.keycloak.token;
    } catch (error) {
      console.error('Token refresh failed', error);
      return undefined;
    }
  }


  login() {
    return this.keycloak.login();
  }

  isLoggedIn(): boolean {
    return !!this.keycloak.authenticated;
  }

  logout() {
    return this.keycloak.logout({
      redirectUri: 'http://localhost:4200/home'
    });
  }

  accountManagement() {
    return this.keycloak.accountManagement();
  }

}
