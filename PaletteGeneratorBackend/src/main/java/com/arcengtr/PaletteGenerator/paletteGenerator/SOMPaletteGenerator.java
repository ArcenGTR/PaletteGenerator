package com.arcengtr.PaletteGenerator.paletteGenerator;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * Color palette generator using Self-Organizing Map (SOM) algorithm
 */
public class SOMPaletteGenerator extends AbstractPaletteGenerator {

    private final int MAX_COLORS = 900;

    private final int gridWidth;
    private final int gridHeight;
    private final double initialLearningRate;
    private final int maxEpochs;

    /**
     * Constructor with default grid size and parameters
     */
    public SOMPaletteGenerator() {
        this(8, 8, 0.5, 200);
    }

    /**
     * Constructor with square grid
     *
     * @param gridSize size of the square grid (gridSize x gridSize)
     */
    public SOMPaletteGenerator(int gridSize) {
        this(gridSize, gridSize, 0.5, 200);
    }

    /**
     * Constructor with custom grid dimensions
     *
     * @param gridWidth width of the SOM grid
     * @param gridHeight height of the SOM grid
     */
    public SOMPaletteGenerator(int gridWidth, int gridHeight) {
        this(gridWidth, gridHeight, 0.5, 200);
    }

    /**
     * Constructor with all parameters
     *
     * @param gridWidth width of the SOM grid
     * @param gridHeight height of the SOM grid
     * @param initialLearningRate initial learning rate for training
     * @param maxEpochs maximum number of training epochs
     */
    public SOMPaletteGenerator(int gridWidth, int gridHeight, double initialLearningRate, int maxEpochs) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.initialLearningRate = initialLearningRate;
        this.maxEpochs = maxEpochs;
    }

    protected int calculatePixelSkip(int numColors, int imageWidth, int imageHeight) {
        return (int) ((Math.sqrt((double) imageWidth * imageHeight / PIXEL_SKIP_AIM)));
    }

    @Override
    public List<List<List<Integer>>> generatePalette(BufferedImage image, int numColors) throws IOException {
        // For SOM, numColors parameter is ignored since we use the grid dimensions
        List<int[]> pixels = extractPixelsFromImage(image, calculatePixelSkip(numColors, image.getWidth(), image.getHeight()));

        SOM som = new SOM(gridWidth, gridHeight, 3, initialLearningRate, maxEpochs);
        som.train(pixels);

        int[][][] colorMap = som.getColorMap();

        List<List<List<Integer>>> palette = new ArrayList<>();
        for (int j = 0; j < gridHeight; j++) {
            palette.add(new ArrayList<>());
        }

        for (int i = 0; i < gridWidth; i++) {
            for (int j = 0; j < gridHeight; j++) {
                List<Integer> color = Arrays.stream(colorMap[i][j]).boxed().toList();
                palette.get(j).add(color);
            }
        }

        return palette;
    }

    /**
     * Save a SOM color map as an image file
     *
     * @param somMap the SOM color map to save
     * @param outPath output file path
     * @throws IOException if the file cannot be written
     */
    public static void saveAsImage(int[][][] somMap, String outPath) throws IOException {
        int width = somMap.length;
        int height = somMap[0].length;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);

        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                int[] rgb = somMap[i][j];
                int color = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
                image.setRGB(j, i, color);
            }
        }
        ImageIO.write(image, "png", new File(outPath));
    }

    /**
     * Nested SOM (Self-Organizing Map) class
     */
    public static class SOM {
        private final int width, height, dim;
        private final double[][][] weights;
        private final double initialLearningRate;
        private final int maxEpochs;

        /**
         * Constructor for SOM
         *
         * @param width width of the SOM grid
         * @param height height of the SOM grid
         * @param dim dimensionality of the input data (3 for RGB)
         * @param initialLearningRate initial learning rate
         * @param maxEpochs maximum number of training epochs
         */
        public SOM(int width, int height, int dim, double initialLearningRate, int maxEpochs) {
            this.width = width;
            this.height = height;
            this.dim = dim;
            this.initialLearningRate = initialLearningRate;
            this.maxEpochs = maxEpochs;
            this.weights = new double[width][height][dim];

            // Initialize weights randomly
            Random rand = new Random();
            for (int i = 0; i < width; i++) {
                for (int j = 0; j < height; j++) {
                    for (int d = 0; d < dim; d++) {
                        weights[i][j][d] = rand.nextDouble();
                    }
                }
            }
        }

        /**
         * Train the SOM with input color data
         *
         * @param inputColors list of RGB color arrays
         */
        public void train(List<int[]> inputColors) {
            for (int epoch = 0; epoch < maxEpochs; epoch++) {
                double learningRate = initialLearningRate * Math.exp(-epoch / (double) maxEpochs);
                double sigma = Math.max(width, height) / 2.0 * Math.exp(-epoch / (double) maxEpochs);

                Collections.shuffle(inputColors);

                for (int[] rgb : inputColors) {
                    double[] input = normalize(rgb);
                    int[] bmu = findBMU(input);
                    updateWeights(input, bmu, learningRate, sigma);
                }
            }
        }

        /**
         * Find the Best Matching Unit (BMU) for given input
         *
         * @param input normalized input vector
         * @return coordinates of the BMU [i, j]
         */
        private int[] findBMU(double[] input) {
            int[] bmu = new int[2];
            double minDist = Double.MAX_VALUE;
            for (int i = 0; i < width; i++) {
                for (int j = 0; j < height; j++) {
                    double dist = euclideanDistance(input, weights[i][j]);
                    if (dist < minDist) {
                        minDist = dist;
                        bmu[0] = i;
                        bmu[1] = j;
                    }
                }
            }
            return bmu;
        }

        /**
         * Update weights based on the BMU and neighborhood function
         *
         * @param input input vector
         * @param bmu Best Matching Unit coordinates
         * @param lr learning rate
         * @param sigma neighborhood radius
         */
        private void updateWeights(double[] input, int[] bmu, double lr, double sigma) {
            double sigmaSq = sigma * sigma;
            for (int i = 0; i < width; i++) {
                for (int j = 0; j < height; j++) {
                    double distSq = Math.pow(i - bmu[0], 2) + Math.pow(j - bmu[1], 2);
                    double influence = Math.exp(-distSq / (2 * sigmaSq));
                    for (int d = 0; d < dim; d++) {
                        weights[i][j][d] += lr * influence * (input[d] - weights[i][j][d]);
                    }
                }
            }
        }

        /**
         * Normalize RGB values to [0, 1] range
         *
         * @param rgb RGB color array [r, g, b]
         * @return normalized array
         */
        private double[] normalize(int[] rgb) {
            return new double[]{rgb[0] / 255.0, rgb[1] / 255.0, rgb[2] / 255.0};
        }

        /**
         * Calculate Euclidean distance between two vectors (differ from one in abstract class)
         *
         * @param a first vector
         * @param b second vector
         * @return Euclidean distance
         */
        private double euclideanDistance(double[] a, double[] b) {
            double sum = 0;
            for (int i = 0; i < a.length; i++) {
                sum += Math.pow(a[i] - b[i], 2);
            }
            return Math.sqrt(sum);
        }

        /**
         * Get the trained color map
         *
         * @return 3D array representing the color map [width][height][rgb]
         */
        public int[][][] getColorMap() {
            int[][][] map = new int[width][height][dim];
            for (int i = 0; i < width; i++) {
                for (int j = 0; j < height; j++) {
                    for (int d = 0; d < dim; d++) {
                        map[i][j][d] = (int) (weights[i][j][d] * 255);
                    }
                }
            }
            return map;
        }
    }
}