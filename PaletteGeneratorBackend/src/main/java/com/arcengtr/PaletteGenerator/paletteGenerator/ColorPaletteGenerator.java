package com.arcengtr.PaletteGenerator.paletteGenerator;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.List;

/**
 * Interface for different color palette generation algorithms
 */
public interface ColorPaletteGenerator {

    /**
     * Generates a color palette from an image
     *
     * @param image buffered image
     * @param numColors number of colors to extract
     * @return List of colors in the palette, each color is a List of integers [r,g,b]
     * @throws IOException if the image cannot be processed
     */
    Object generatePalette(BufferedImage image, int numColors) throws IOException;
}