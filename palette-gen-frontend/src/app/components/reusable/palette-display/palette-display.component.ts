import { KeycloakService } from './../../../services/keycloak/keycloak.service';
import { PaletteService } from './../../../services/palette/palette.service';
import { Component, Input, SimpleChanges, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzRadioModule } from 'ng-zorro-antd/radio'; // For the radio buttons
import { FormsModule } from '@angular/forms'; // For ngModel
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonModule } from "ng-zorro-antd/button";
import { PaletteItem } from '../../../models/palette-item.model';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-palette-display',
  imports: [
    CommonModule,
    NzRadioModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule
],
  standalone: true,
  templateUrl: './palette-display.component.html',
  styleUrl: './palette-display.component.scss'
})
export class PaletteDisplayComponent {
  @Input() paletteItem: PaletteItem | null = null; // Input: the PaletteItem object
  @Output() paletteSaved = new EventEmitter<void>();
  @Output() palettePublished = new EventEmitter<void>();

  imageUrl: string | ArrayBuffer | null | undefined = null;
  palette: number[][] = [];

  private rawProcessedColors: { original: number[]; hex: string; rgb: string; hsl: string; luminance: number; hue: number }[] = [];
  displayedColors: { original: number[]; formatted: string; hex: string; rgb: string; hsl: string; luminance: number; hue: number }[] = [];

  currentFormat: 'rgb' | 'hex' | 'hsl' = 'rgb';
  currentSortOrder: 'none' | 'luminance' | 'hue' = 'none';

  private message = inject(NzMessageService);
  private paletteService = inject(PaletteService);
  public keycloakService = inject(KeycloakService);

  modalRef = inject(NzModalRef, { optional: true });
  modalData = inject(NZ_MODAL_DATA, { optional: true });

  ngOnInit(): void {
    if (!this.paletteItem && this.modalData) {
      this.paletteItem = this.modalData.paletteItem;
    }
    
    this.imageUrl = this.paletteItem?.imageUrl || null;
    this.palette = this.paletteItem?.palette || [];

    this.initializeColors();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['palette'] || changes['imageUrl']) {
      this.initializeColors();
    }
  }

  private initializeColors(): void {
    this.rawProcessedColors = this.palette.map(color => {
      const hex = this.formatColor(color[0], color[1], color[2], 'hex');
      const rgb = this.formatColor(color[0], color[1], color[2], 'rgb');
      const hsl = this.formatColor(color[0], color[1], color[2], 'hsl');
      const luminance = this.calculateLuminance(color[0], color[1], color[2]);
      const hue = this.calculateHue(color[0], color[1], color[2]);

      return {
        original: color,
        hex: hex,
        rgb: rgb,
        hsl: hsl,
        luminance: luminance,
        hue: hue
      };
    });
    this.applySortAndFormat();
  }

  applySortAndFormat(): void {
    let colorsToSort = [...this.rawProcessedColors];

    if (this.currentSortOrder === 'luminance') {
      colorsToSort.sort((a, b) => a.luminance - b.luminance);
    } else if (this.currentSortOrder === 'hue') {
      colorsToSort.sort((a, b) => a.hue - b.hue);
    }

    this.displayedColors = colorsToSort.map(color => ({
      ...color,
      formatted: this.formatColor(color.original[0], color.original[1], color.original[2], this.currentFormat)
    }));
  }

  onFormatChange(): void {
    this.applySortAndFormat();
  }

  onSortChange(): void {
    this.applySortAndFormat();
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
    if (this.palette.length === 0) {
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
    if (this.palette.length === 0) {
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

  get isModalView(): boolean {
    return !!this.modalData;
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

  private calculateLuminance(r: number, g: number, b: number): number {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  private calculateHue(r: number, g: number, b: number): number {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;

    if (d === 0) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return h * 360;
  }

  close() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}