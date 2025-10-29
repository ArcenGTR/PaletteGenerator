import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { KeycloakService } from '../../services/keycloak/keycloak.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule,
            RouterModule,
            NzDropDownModule,
            NzIconModule,
            NzInputModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public keycloakService = inject(KeycloakService);
  public router = inject(Router);
  public message = inject(NzMessageService);

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  async logout(): Promise<void> {
    await this.keycloakService.logout();
    this.message.info('You have been logged out.');
  }

  accountManagement(): void {
    this.keycloakService.accountManagement();
  }
}
