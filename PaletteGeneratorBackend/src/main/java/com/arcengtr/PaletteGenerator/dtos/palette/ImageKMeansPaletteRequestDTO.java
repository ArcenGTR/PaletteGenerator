package com.arcengtr.PaletteGenerator.dtos.palette;

import lombok.Data;

@Data
public class ImageKMeansPaletteRequestDTO {

    private String base64Image;
    private boolean useKMeansPP;
    private int numColors;

}
