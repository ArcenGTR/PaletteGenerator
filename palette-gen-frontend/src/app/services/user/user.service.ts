import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private backendUrl = 'http://localhost:8080/api/v1/user';

  private http: HttpClient = inject(HttpClient);

  getCurrentUserInfo() {
    return this.http.get<User>(`${this.backendUrl}/info`);
  }
  
}
