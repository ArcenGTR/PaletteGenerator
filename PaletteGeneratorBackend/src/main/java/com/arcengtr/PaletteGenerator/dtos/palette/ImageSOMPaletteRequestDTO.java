package com.arcengtr.PaletteGenerator.dtos.palette;

import lombok.Data;

@Data
public class ImageSOMPaletteRequestDTO {

    private String base64Image;
    private int mapWidth;
    private int mapHeight;

}
