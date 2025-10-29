export class PaletteItem {
    paletteId: string = '';
    votes: number = 0;
    method: 'kmeans' | 'hierarchical' | 'som' = 'kmeans';
    palette: number[][] | null = null;
    kohonenMap: number[][][] | null = null;
    mergeHistory: number[][][] | null = null;
    imageUrl: string | ArrayBuffer | null = null;
}