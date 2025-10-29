import { PaletteItem } from './../../../models/palette-item.model';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message'; // Для уведомлений
import { NzRadioModule } from 'ng-zorro-antd/radio'; // Для кнопок выбора формата
import { FormsModule } from '@angular/forms'; // Для ngModel
import { PaletteService } from '../../../services/palette/palette.service';
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { KeycloakService } from '../../../services/keycloak/keycloak.service';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-som-display',
  imports: [
    CommonModule,
    NzRadioModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule
],
  templateUrl: './som-display.component.html',
  styleUrl: './som-display.component.scss'
})
export class SomDisplayComponent {
  @Input() paletteItem: PaletteItem | null = null; // Input: the PaletteItem object
  @Input() mapWidth: number = 0;
  @Input() mapHeight: number = 0;
  @Input() kohonenMap: number[][][] = [];
  @Output() paletteSaved = new EventEmitter<void>();
  @Output() palettePublished = new EventEmitter<void>();

  imageUrl: string | ArrayBuffer | null = null;

  // This will be a flat array of HEX strings for easier rendering with *ngFor
  private rawProcessedColors: { original: number[]; hex: string; rgb: string; hsl: string }[] = [];
  displayColors: { original: number[]; formatted: string; hex: string; rgb: string; hsl: string }[] = [];

  currentFormat: 'rgb' | 'hex' | 'hsl' = 'hex';
  
  // Dynamic cell size based on map dimensions and container width
  cellSizePx: number = 24;
  mapWidthFixed: number = 0;
  mapHeightFixed: number = 0;

  internalShowGaps: boolean = false;

  private message = inject(NzMessageService);
  private paletteService = inject(PaletteService);
  public keycloakService = inject(KeycloakService);

  modalRef = inject(NzModalRef, { optional: true });
  modalData = inject(NZ_MODAL_DATA, { optional: true });

  ngOnInit(): void {
    if (this.modalData) {
      this.paletteItem = this.modalData.paletteItem;
      this.mapWidth = this.modalData.mapWidth || 0;
      this.mapHeight = this.modalData.mapHeight || 0;
      this.kohonenMap = this.modalData.kohonenMap || [];
      this.imageUrl = this.paletteItem?.imageUrl || null;

      if (this.kohonenMap.length > 0) {
        this.processMap();
      }
    } else {
      this.kohonenMap = this.paletteItem?.kohonenMap || [];
      this.imageUrl = this.paletteItem?.imageUrl || null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.modalData && (changes['kohonenMap'] || changes['imageUrl'])) {
      this.processMap();
    }
  }

  get isModalView(): boolean {
    return !!this.modalData;
  }

  private processMap(): void {
    if (!this.kohonenMap || this.kohonenMap.length === 0 || this.mapWidth === 0 || this.mapHeight === 0) {
      this.displayColors = [];
      this.rawProcessedColors = [];
      this.cellSizePx = 24;
      this.mapWidthFixed = 0;
      this.mapHeightFixed = 0;
      this.internalShowGaps = false;
      return;
    }

    this.mapWidthFixed = this.mapWidth;
    this.mapHeightFixed = this.mapHeight;

    // Flatten the 2D array of RGB to a 1D array of HEX strings
    this.rawProcessedColors = this.kohonenMap.flat().map(rgb => ({
      original: rgb,
      hex: this.formatColor(rgb[0], rgb[1], rgb[2], 'hex'),
      rgb: this.formatColor(rgb[0], rgb[1], rgb[2], 'rgb'),
      hsl: this.formatColor(rgb[0], rgb[1], rgb[2], 'hsl')
    }));

    // Calculate dynamic cell size
    this.calculateCellSize();
    // Update displayed colors with current format
    this.applyColorFormat();
  }

  private calculateCellSize(): void {
    const maxContainerWidth = 400;
    const maxDesiredCellSize = 32;
    const minDesiredCellSize = 16;

    if (this.mapWidth > 0) {
        let potentialCellSize = maxContainerWidth / this.mapWidth;
        this.cellSizePx = Math.max(minDesiredCellSize, Math.min(maxDesiredCellSize, potentialCellSize));
    } else {
        this.cellSizePx = minDesiredCellSize; // Default if width is 0
    }
    if (this.mapHeight > 0) {
        const potentialCellSizeHeight = maxContainerWidth / this.mapHeight;
        this.cellSizePx = Math.min(this.cellSizePx, potentialCellSizeHeight);
    }
  }

  applyColorFormat(): void {
    this.displayColors = this.rawProcessedColors.map(color => ({
      ...color,
      formatted: this.formatColor(color.original[0], color.original[1], color.original[2], this.currentFormat)
    }));
  }

  onFormatChange(): void {
    this.applyColorFormat();
  }

  onGapChange(): void {
    this.internalShowGaps = !this.internalShowGaps;
  }

  copyColorToClipboard(colorValue: string): void {
    navigator.clipboard.writeText(colorValue).then(() => {
      this.message.success(`Color "${colorValue}" copied to clipboard!`);
    }).catch(err => {
      this.message.error('Failed to copy color to clipboard.');
      console.error('Error copying to clipboard:', err);
    });
  }

  savePalette(): void {
    if (this.kohonenMap.length === 0) {
      this.message.warning('There is no palette to save.');
      return;
    }

    this.paletteService.savePalette(this.paletteItem?.paletteId).subscribe({
      next: () => {
        this.message.success('Palette saved successfully!');
        this.paletteSaved.emit();
      },
      error: (error) => {
        console.error('Save failed:', error);
        this.message.error('Failed to save palette. Please try again.');
      }
    });
  }

  publishPalette(): void {
    if (this.kohonenMap.length === 0) {
      this.message.warning('There is no palette to publish.');
      return;
    }

    this.paletteService.publishPalette(this.paletteItem?.paletteId).subscribe({
      next: () => {
        this.message.success('Palette published successfully!');
        this.palettePublished.emit();
      },
      error: (error) => {
        console.error('Publish failed:', error);
        this.message.error('Failed to publish palette. Please try again.');
      }
    });
  }

  private formatColor(r: number, g: number, b: number, format: string): string {
    switch (format) {
      case 'hex': return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
      case 'rgb': return `rgb(${r}, ${g}, ${b})`;
      case 'hsl':
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max === min) { h = s = 0; }
        else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
      default: return '';
    }
  }

  close() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
