import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaletteItem } from '../../models/palette-item.model';
import { Page } from '../../models/page.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaletteService {

  private backendUrl = `${environment.API_URI}/palette`;

  private http: HttpClient = inject(HttpClient);

  generateKMeansPalette(base64Image: string, useKMeansPP: boolean, numColors: number): Observable<{ palette: number[][] }> {
    const requestBody = { base64Image, useKMeansPP, numColors };
    return this.http.post<{ palette: number[][] }>(`${this.backendUrl}/generate/kmeans`, requestBody);
  }

  generateHierarchicalPalette(base64Image: string, depth: 'shallow' | 'medium' | 'deep', numColors: number): Observable<{ palette: number[][][] }> {
    const requestBody = { base64Image, historyDepth: depth, numColors };
    return this.http.post<{ palette: number[][][] }>(`${this.backendUrl}/generate/history`, requestBody);
  }

  generateSOMPalette(base64Image: string, mapWidth: number, mapHeight: number): Observable<{ palette: number[][][] }> {
    const requestBody = { base64Image, mapWidth, mapHeight };
    return this.http.post<{ palette: number[][][] }>(`${this.backendUrl}/generate/som`, requestBody);
  }

  savePalette(paletteId: string | undefined) {
    return this.http.post(`${this.backendUrl}/save/${paletteId}`, {});
  }

  publishPalette(paletteId: string | undefined) {
    return this.http.post(`${this.backendUrl}/publish/${paletteId}`, {});
  }

  savePaletteToHistory(paletteItem: PaletteItem): Observable<PaletteItem> {
    return this.http.post<PaletteItem>(`${this.backendUrl}/save/history`, paletteItem);
  }

  getPaletteHistory(): Observable<PaletteItem[]> {
    return this.http.get<PaletteItem[]>(`${this.backendUrl}/history`);
  }

  deleteUserHistory(): Observable<void> {
    return this.http.delete<void>(`${this.backendUrl}/delete/history`);
  }

  getPublishedPalettes(): Observable<PaletteItem[]> {
    return this.http.get<PaletteItem[]>(`${this.backendUrl}/published`);
  }

  getPublishedPalettesPage(page: number, size: number): Observable<Page<PaletteItem>> {
    return this.http.get<Page<PaletteItem>>(`${this.backendUrl}/published?page=${page}&size=${size}`);
  }

  votePalette(paletteId: string | undefined) {
    return this.http.post(`${this.backendUrl}/vote/${paletteId}`, {});
  }

  unvotePalette(paletteId: string | undefined) {
    return this.http.delete<void>(`${this.backendUrl}/vote/${paletteId}`, {});
  }

  getPaletteById(paletteId: string): Observable<PaletteItem> {
    return this.http.get<PaletteItem>(`${this.backendUrl}/${paletteId}`);
  }

  getUserVotedPalettes(): Observable<PaletteItem[]> {
    return this.http.get<PaletteItem[]>(`${this.backendUrl}/voted`);
  }

  getUserSavedPalettes(): Observable<PaletteItem[]> {
    return this.http.get<PaletteItem[]>(`${this.backendUrl}/saved`);
  }

  deletePalette(paletteId: string) {
    return this.http.delete(`${this.backendUrl}/palettes/${paletteId}`);
  }
}
