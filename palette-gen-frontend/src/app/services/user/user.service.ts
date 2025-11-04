import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private backendUrl = `${environment.API_URI}/user`;

  private http: HttpClient = inject(HttpClient);

  getCurrentUserInfo() {
    return this.http.get<User>(`${this.backendUrl}/info`);
  }
  
}
