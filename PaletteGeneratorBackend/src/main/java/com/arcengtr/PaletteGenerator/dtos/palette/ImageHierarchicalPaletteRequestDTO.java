package com.arcengtr.PaletteGenerator.dtos.palette;

import lombok.Data;

@Data
public class ImageHierarchicalPaletteRequestDTO {

    private String base64Image;
    private String historyDepth;
    private int numColors;

}
