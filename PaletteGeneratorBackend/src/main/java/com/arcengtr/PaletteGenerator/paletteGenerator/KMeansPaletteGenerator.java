package com.arcengtr.PaletteGenerator.paletteGenerator;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Color palette generator using K-means clustering algorithm
 */
public class KMeansPaletteGenerator extends AbstractPaletteGenerator {

    // Variable should be consistent
    private final int MAX_COLORS = 16;

    private final int numIterations;
    private final boolean usePlusPlus;

    /**
     * Constructor with default settings
     */
    public KMeansPaletteGenerator() {
        this(10, true);
    }

    /**
     * Constructor with custom settings
     *
     * @param numIterations number of k-means iterations
     * @param usePlusPlus whether to use k-means++ initialization
     */
    public KMeansPaletteGenerator(int numIterations, boolean usePlusPlus) {
        this.numIterations = numIterations;
        this.usePlusPlus = usePlusPlus;
    }

    @Override
    public List<List<Integer>> generatePalette(BufferedImage image, int numColors) throws IOException {
        List<int[]> pixels = extractPixelsFromImage(image, calculatePixelSkip(numColors, image.getWidth(), image.getHeight()));
        List<int[]> primitivePalette = kMeans(pixels, numColors, numIterations, usePlusPlus);
        return convertToIntegerList(primitivePalette);
    }

    @Override
    protected int calculatePixelSkip(int numColors, int imageWidth, int imageHeight) {
        return (int) ((Math.sqrt((double) imageWidth * imageHeight / PIXEL_SKIP_AIM)) * (Math.log(MAX_COLORS + 1) / Math.log(numColors + 1)));
    }

    /**
     * Run k-means clustering on pixel data
     *
     * @param pixels list of pixel colors
     * @param k number of clusters/colors
     * @param iterations number of iterations
     * @param kMeanPPCentroids whether to use k-means++ initialization
     * @return list of center colors
     */
    private List<int[]> kMeans(List<int[]> pixels, int k, int iterations, boolean kMeanPPCentroids) {
        Random rand = new Random();

        List<int[]> centroids;
        if (kMeanPPCentroids) {
            centroids = KMeansPlusPlusCentroidsInit(pixels, k);
        } else {
            centroids = new ArrayList<>();

            for (int i = 0; i < k; i++) {
                centroids.add(pixels.get(rand.nextInt(pixels.size())));
            }
        }

        List<List<int[]>> clusters = new ArrayList<>();
        for (int i = 0; i < k; i++) {
            clusters.add(new ArrayList<>());
        }

        for (int iter = 0; iter < iterations; iter++) {
            // Clear clusters
            for (List<int[]> cluster : clusters) {
                cluster.clear();
            }

            // Assign pixels to clusters
            for (int[] pixel : pixels) {
                int nearest = 0;
                double minDist = Double.MAX_VALUE;

                for (int i = 0; i < k; i++) {
                    double dist = colorDistance(pixel, centroids.get(i));
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = i;
                    }
                }

                clusters.get(nearest).add(pixel);
            }

            // Update centroids
            for (int i = 0; i < k; i++) {
                if (clusters.get(i).isEmpty()) continue;

                int[] sum = new int[3];
                for (int[] p : clusters.get(i)) {
                    sum[0] += p[0];
                    sum[1] += p[1];
                    sum[2] += p[2];
                }

                int size = clusters.get(i).size();
                centroids.set(i, new int[]{sum[0] / size, sum[1] / size, sum[2] / size});
            }
        }

        return centroids;
    }

    /**
     * Initialize centroids for k-means++ algorithm
     *
     * @param pixels list of pixel colors
     * @param k number of clusters/colors
     * @return initialized list of centroids
     */
    private List<int[]> KMeansPlusPlusCentroidsInit(List<int[]> pixels, int k) {
        Random rand = new Random();
        List<int[]> centroids = new ArrayList<>();

        centroids.add(pixels.get(rand.nextInt(pixels.size())));

        while (centroids.size() < k) {
            List<Double> distances = new ArrayList<>();
            double sum = 0;

            for (int[] pixel : pixels) {
                double minDist = Double.MAX_VALUE;
                for (int[] centroid : centroids) {
                    double dist = colorDistance(pixel, centroid);
                    if (dist < minDist) minDist = dist;
                }
                double d2 = Math.pow(minDist, 2);
                distances.add(d2);
                sum += d2;
            }

            double r = rand.nextDouble() * sum;

            double cumulative = 0;
            for (int i = 0; i < pixels.size(); i++) {
                cumulative += distances.get(i);
                if (cumulative >= r) {
                    centroids.add(pixels.get(i));
                    break;
                }
            }
        }

        return centroids;
    }
}