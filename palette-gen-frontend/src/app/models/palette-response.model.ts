export interface PaletteResponse<T> {
  palette: T;
}

export type KMeansPaletteResponse = PaletteResponse<number[][]>;
export type HierarchicalPaletteResponse = PaletteResponse<number[][][]>;
export type SOMPaletteResponse = PaletteResponse<number[][][]>;
