package com.arcengtr.PaletteGenerator.paletteGenerator;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.image.Raster;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Abstract class providing common functionality for color palette generators
 */
public abstract class AbstractPaletteGenerator implements ColorPaletteGenerator {

    final int PIXEL_SKIP_AIM = 130;

    /**
     * Abstract method to calculate the pixel skip interval.
     * Each concrete algorithm must implement its own version of this calculation,
     * using its specific MAX_COLORS and formula.
     *
     * @param numColors number of colors to extract
     * @param imageWidth width of the image
     * @param imageHeight height of the image
     * @return the calculated pixel skip interval
     */
    protected abstract int calculatePixelSkip(int numColors, int imageWidth, int imageHeight);

    /**
     * Extract pixels from an image with specified skip interval
     *
     * @param image buffered image
     * @param pixelSkip interval between pixels to sample
     * @return List of pixel colors as int arrays [r,g,b]
     * @throws IOException if the image cannot be read
     */
    protected List<int[]> extractPixelsFromImage(BufferedImage image, int pixelSkip) throws IOException {

        if (pixelSkip <= 0) {
            throw new IOException("Pixel skip must be greater than 0");
        }

        BufferedImage img = image;
        int width = img.getWidth();
        int height = img.getHeight();

        Raster raster = img.getRaster();
        int numBands = raster.getNumBands();
        int[] pixel = new int[numBands];

        List<int[]> pixels = new ArrayList<>();

        for (int y = 0; y < height; y += pixelSkip) {
            for (int x = 0; x < width; x += pixelSkip) {
                raster.getPixel(x, y, pixel);
                pixels.add(Arrays.copyOf(pixel, Math.min(3, pixel.length)));
            }
        }

        return pixels;
    }

    /**
     * Calculate the Euclidean distance between two colors
     *
     * @param c1 first color as int array [r,g,b]
     * @param c2 second color as int array [r,g,b]
     * @return the distance between the colors
     */
    protected double colorDistance(int[] c1, int[] c2) {
        return Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2) + Math.pow(c1[2] - c2[2], 2));
    }

    /**
     * Calculate the average color from a list of colors
     *
     * @param points list of colors as int arrays [r,g,b]
     * @return the average color as int array [r,g,b]
     */
    protected int[] averageColor(List<int[]> points) {
        int r = 0, g = 0, b = 0;
        for (int[] p : points) {
            r += p[0];
            g += p[1];
            b += p[2];
        }
        int size = points.size();
        return new int[]{r / size, g / size, b / size};
    }

    /**
     * Convert a list of primitive int arrays to a list of Integer lists
     *
     * @param primitiveColors list of colors as int arrays [r,g,b]
     * @return list of colors as List<Integer> objects
     */
    protected List<List<Integer>> convertToIntegerList(List<int[]> primitiveColors) {
        return primitiveColors.stream()
                .map(color -> Arrays.stream(color).boxed().toList())
                .toList();
    }
}