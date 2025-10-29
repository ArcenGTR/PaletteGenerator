package com.arcengtr.PaletteGenerator.dtos.palette;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GeneratedSOMPaletteResponseDTO {
    private List<List<List<Integer>>> palette;
}
