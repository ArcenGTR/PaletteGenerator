import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { catchError, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PaletteDisplayComponent } from '../reusable/palette-display/palette-display.component';
import { SomDisplayComponent } from '../reusable/som-display/som-display.component';
import { HierarchicalHistoryComponent } from '../reusable/hierarchical-history/hierarchical-history.component';

import { PaletteService } from '../../services/palette/palette.service';
import { KeycloakService } from '../../services/keycloak/keycloak.service';

import {
  HierarchicalPaletteResponse,
  KMeansPaletteResponse,
  SOMPaletteResponse,
} from '../../models/palette-response.model';
import { PaletteItem } from '../../models/palette-item.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzRadioModule,
    NzInputNumberModule,
    NzButtonModule,
    NzIconModule,
    PaletteDisplayComponent,
    SomDisplayComponent,
    HierarchicalHistoryComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private readonly message = inject(NzMessageService);
  private readonly paletteService = inject(PaletteService);
  private readonly keycloakService = inject(KeycloakService);
  private readonly destroyRef = inject(DestroyRef);

  imageUrl: string | ArrayBuffer | null = null;
  uploadedFile: File | null = null;

  // Generation parameters
  generationMethod: 'kmeans' | 'hierarchical' | 'som' = 'kmeans';
  numColors = 5;
  useKMeansPP = true;
  somMapWidth = 12;
  somMapHeight = 12;
  hierarchicalHistoryDepth: 'shallow' | 'medium' | 'deep' = 'medium';

  // Data
  paletteHistory: PaletteItem[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadUserHistory();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.message.warning('No file selected.');
      this.clearImage(false);
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.message.error('Please select an image file (PNG, JPG, JPEG).');
      this.clearImage(false);
      return;
    }

    this.uploadedFile = file;
    const reader = new FileReader();

    reader.onload = () => {
      this.imageUrl = reader.result;
      this.message.success(`File '${file.name}' successfully loaded for preview.`);
    };

    reader.onerror = () => {
      this.message.error(`Failed to read file '${file.name}'.`);
      this.clearImage(false);
    };

    reader.readAsDataURL(file);
  }

  onMethodChange(): void {
    this.numColors =
      this.generationMethod === 'kmeans' ? 8 :
      this.generationMethod === 'hierarchical' ? 5 :
      this.numColors;
  }

  //might be reworked later for updating just local view without reloading whole history 
  onPaletteSaved(): void {
    //console.log('Palette saved, reloading history...');
    this.loadUserHistory();
  }

  //might be reworked later for updating just local view without reloading whole history 
  onPalettePublished(): void {
    //console.log('Palette published, reloading history...');
    this.loadUserHistory();
  }

  generatePalette(): void {
    if (!this.uploadedFile) {
      this.message.warning('Please upload an image to generate a palette.');
      return;
    }

    this.isLoading = true;
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Image = (reader.result as string).split(',')[1];
      if (!base64Image) {
        this.handleError('Failed to convert image to Base64.');
        return;
      }

      const compressedImageUrl = await this.compressImage(reader.result as string, 400, 400, 0.6);

      switch (this.generationMethod) {
        case 'kmeans':
          this.handleRequest(
            this.paletteService.generateKMeansPalette(base64Image, this.useKMeansPP, this.numColors),
            (response: KMeansPaletteResponse) => ({
              paletteId: '',
              votes: 0,
              method: 'kmeans',
              palette: response.palette,
              kohonenMap: null,
              mergeHistory: null,
              imageUrl: compressedImageUrl,
            })
          );
          break;

        case 'hierarchical':
          this.handleRequest(
            this.paletteService.generateHierarchicalPalette(base64Image, this.hierarchicalHistoryDepth, this.numColors),
            (response: HierarchicalPaletteResponse) => ({
              paletteId: '',
              votes: 0,
              method: 'hierarchical',
              palette: null,
              kohonenMap: null,
              mergeHistory: response.palette,
              imageUrl: compressedImageUrl,
            })
          );
          break;

        case 'som':
          this.handleRequest(
            this.paletteService.generateSOMPalette(base64Image, this.somMapWidth, this.somMapHeight),
            (response: SOMPaletteResponse) => ({
              paletteId: '',
              votes: 0,
              method: 'som',
              palette: null,
              kohonenMap: response.palette,
              mergeHistory: null,
              imageUrl: compressedImageUrl,
            })
          );
          break;

        default:
          this.handleError('Invalid generation method selected.');
      }
    };

    reader.onerror = () => this.handleError('Failed to read file for server submission.');
    reader.readAsDataURL(this.uploadedFile);
  }

  clearImage(showMessage = true): void {
    this.imageUrl = null;
    this.uploadedFile = null;

    if (showMessage) {
      this.message.info('Image cleared. You can upload a new one.');
    }
  }

  clearHistory(): void {
    if (this.keycloakService.isLoggedIn()) {
      this.paletteService.deleteUserHistory()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.message.success('User history cleared successfully.');
          },
          error: () => {
            this.message.error(`Failed to clear user history`);
          }
        });
    }

    this.clearLocalHistory();
  }

  // --- Private helpers ---

  private compressImage(base64Image: string, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Image;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
    });
  }

  private handleRequest<T>(
    request$: any,
    mapper: (response: T) => PaletteItem
  ): void {
    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: HttpErrorResponse) => {
          this.handleError(`Server error ${error.status}: ${error.statusText}`);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response: T) => {
          this.isLoading = false;
          const historyItem = mapper(response);
          this.addToHistory(historyItem);
          this.message.success('Palette and associated data successfully generated!');
        },
      });
  }

  private handleError(message: string): void {
    this.isLoading = false;
    this.message.error(message);
  }

  private addToHistory(item: PaletteItem): void {
    if (this.keycloakService.isLoggedIn()) {
      this.paletteService.savePaletteToHistory(item)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError((error: HttpErrorResponse) => {
            this.message.error(`Failed to save history: ${error.statusText}`);
            return throwError(() => error);
          })
        )
        .subscribe((savedItem: PaletteItem) => {
          this.paletteHistory.unshift(savedItem);
          this.saveLocalHistory();
        });
    } else {
      this.paletteHistory.unshift(item);
      this.saveLocalHistory();
    }
  }

  private saveLocalHistory(): void {
    localStorage.setItem('paletteHistory', JSON.stringify(this.paletteHistory));
  }

  private loadLocalHistory(): void {
    const historyJson = localStorage.getItem('paletteHistory');
    this.paletteHistory = historyJson ? JSON.parse(historyJson) : [];
  }

  private clearLocalHistory(): void {
    this.paletteHistory = [];
    this.saveLocalHistory();
  }

  private loadUserHistory(): void {
    if (this.keycloakService.isLoggedIn()) {
      this.clearLocalHistory();
      this.paletteService.getPaletteHistory()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (history) => {
            this.paletteHistory = history;
          },
          error: (err) => console.error('Error fetching history:', err),
        });
    } else {
      this.loadLocalHistory();
    }
  }
}
