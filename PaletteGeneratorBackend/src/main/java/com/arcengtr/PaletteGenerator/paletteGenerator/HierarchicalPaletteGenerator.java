package com.arcengtr.PaletteGenerator.paletteGenerator;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.*;

/**
 * Color palette generator using hierarchical clustering algorithm
 */
/**
 * Color palette generator using hierarchical clustering algorithm
 */
public class HierarchicalPaletteGenerator extends AbstractPaletteGenerator {

    private final int MAX_COLORS = 8;

    /**
     * Constructor with default settings
     */
    public HierarchicalPaletteGenerator() {

    }

    /**
     * Generate a color palette from an image using hierarchical clustering.
     *
     * @param image     input image
     * @param numColors desired number of colors in the palette
     * @return list of final cluster nodes representing dominant colors
     * @throws IOException if an error occurs while processing the image
     */
    @Override
    public List<ClusterNode> generatePalette(BufferedImage image, int numColors) throws IOException {
        List<int[]> pixels = extractPixelsFromImage(image, calculatePixelSkip(numColors, image.getWidth(), image.getHeight()));
        return hierarchicalClusteringWithHistories(pixels, numColors);
    }

    /**
     * Calculate the pixel skip value to reduce image resolution for clustering.
     *
     * @param numColors   target number of colors
     * @param imageWidth  image width
     * @param imageHeight image height
     * @return number of pixels to skip while sampling
     */
    @Override
    protected int calculatePixelSkip(int numColors, int imageWidth, int imageHeight) {
        return (int) ((Math.sqrt((double) imageWidth * imageHeight / PIXEL_SKIP_AIM)) * (Math.log(MAX_COLORS + 1) / Math.log(numColors + 1)));
    }

    /**
     * Perform hierarchical clustering with history tracking
     *
     * @param pixels             list of pixel colors
     * @param targetClusterCount desired number of clusters
     * @return list of final clusters with their histories
     */
    private List<ClusterNode> hierarchicalClusteringWithHistories(
            List<int[]> pixels, int targetClusterCount) {

        List<int[]> points = new ArrayList<>(pixels);
        int nextId = 0;

        List<ClusterNode> clusters = new ArrayList<>();
        List<ClusterNode> mergeHistory = new ArrayList<>();

        // Create initial clusters
        for (int[] pixel : points) {
            List<int[]> singlePoint = new ArrayList<>();
            singlePoint.add(pixel);
            clusters.add(new ClusterNode(pixel, singlePoint, nextId++));
        }

        // Main clustering loop
        while (clusters.size() > targetClusterCount) {
            double minDist = Double.MAX_VALUE;
            int a = -1, b = -1;

            for (int i = 0; i < clusters.size(); i++) {
                for (int j = i + 1; j < clusters.size(); j++) {
                    double dist = colorDistance(clusters.get(i).color, clusters.get(j).color);
                    if (dist < minDist) {
                        minDist = dist;
                        a = i;
                        b = j;
                    }
                }
            }

            ClusterNode c1 = clusters.get(a);
            ClusterNode c2 = clusters.get(b);

            List<int[]> mergedPoints = new ArrayList<>();
            mergedPoints.addAll(c1.points);
            mergedPoints.addAll(c2.points);

            int[] centroid = averageColor(mergedPoints);

            ClusterNode merged = new ClusterNode(centroid, mergedPoints, nextId++);
            merged.left = c1;
            merged.right = c2;

            mergeHistory.add(merged);

            clusters.remove(b);
            clusters.remove(a);
            clusters.add(merged);
        }

        return clusters;
    }

    /**
     * Extract a subtree from a cluster node representing its formation history.
     * The resulting subtree contains up to historyDepth significant merge nodes.
     *
     * @param root             the root cluster node to start from
     * @param historyDepth     the maximum depth of history nodes to retain
     * @param maxPointsPerNode the maximum number of points to store in each node
     * @return a new ClusterNode representing the history subtree
     */
    public ClusterNode extractClusterHistorySubtree(ClusterNode root, int historyDepth, int maxPointsPerNode) {
        if (root == null || historyDepth <= 0) return null;

        Set<Integer> selectedIds = new HashSet<>();
        selectEvenlySpacedMergeNodes(root, historyDepth, selectedIds);

        ClusterNode filtered = filterSubtree(root, selectedIds, maxPointsPerNode);
        return trimTreeDepth(filtered, historyDepth);
    }

    /**
     * Select evenly spaced merge nodes based on tree level.
     *
     * @param root        root node of the cluster tree
     * @param depth       desired number of history nodes
     * @param selectedIds set to fill with selected node IDs
     */
    private void selectEvenlySpacedMergeNodes(ClusterNode root, int depth, Set<Integer> selectedIds) {
        Map<Integer, List<ClusterNode>> levels = new HashMap<>();
        fillLevels(root, 0, levels);

        int maxLevel = levels.keySet().stream().max(Integer::compareTo).orElse(0);
        int step = Math.max(1, maxLevel / depth);

        for (int i = 0; i <= maxLevel && selectedIds.size() < depth; i += step) {
            List<ClusterNode> levelNodes = levels.get(i);
            if (levelNodes != null && !levelNodes.isEmpty()) {
                ClusterNode middle = levelNodes.get(levelNodes.size() / 2);
                selectedIds.add(middle.id);
            }
        }
    }

    /**
     * Populate a map with nodes grouped by their level in the tree.
     *
     * @param node   current node
     * @param level  current level in the tree
     * @param levels map to store level-node lists
     */
    private void fillLevels(ClusterNode node, int level, Map<Integer, List<ClusterNode>> levels) {
        if (node == null) return;
        if (node.left != null && node.right != null) {
            levels.computeIfAbsent(level, k -> new ArrayList<>()).add(node);
            fillLevels(node.left, level + 1, levels);
            fillLevels(node.right, level + 1, levels);
        }
    }

    /**
     * Reconstruct a filtered subtree containing only selected nodes.
     *
     * @param node             current node
     * @param selectedIds      set of node IDs to retain
     * @param maxPointsPerNode limit for point list size
     * @return filtered ClusterNode subtree
     */
    private ClusterNode filterSubtree(ClusterNode node, Set<Integer> selectedIds, int maxPointsPerNode) {
        if (node == null) return null;

        ClusterNode left = filterSubtree(node.left, selectedIds, maxPointsPerNode);
        ClusterNode right = filterSubtree(node.right, selectedIds, maxPointsPerNode);

        if (selectedIds.contains(node.id) || (node.left == null && node.right == null)) {
            List<int[]> limitedPoints = limitPoints(node.points, maxPointsPerNode);
            ClusterNode copy = new ClusterNode(node.color, limitedPoints, node.id);
            copy.left = left;
            copy.right = right;
            return copy;
        }

        if (left != null && right != null) {
            List<int[]> mergedPoints = limitPoints(mergePoints(left.points, right.points), maxPointsPerNode);
            int[] avg = averageColor(mergedPoints);
            ClusterNode dummy = new ClusterNode(avg, mergedPoints, node.id);
            dummy.left = left;
            dummy.right = right;
            return dummy;
        }

        return left != null ? left : right;
    }

    /**
     * Limit the number of points in a list to the specified maximum.
     *
     * @param points list of points
     * @param limit  maximum number of points
     * @return limited list of points
     */
    private List<int[]> limitPoints(List<int[]> points, int limit) {
        if (points == null || points.size() <= limit) return points;
        return points.subList(0, limit);
    }

    /**
     * Merge two lists of points into a single list.
     *
     * @param a first list
     * @param b second list
     * @return merged list of points
     */
    private List<int[]> mergePoints(List<int[]> a, List<int[]> b) {
        List<int[]> merged = new ArrayList<>();
        if (a != null) merged.addAll(a);
        if (b != null) merged.addAll(b);
        return merged;
    }

    /**
     * Trim a tree to a specific maximum depth.
     *
     * @param node     root node of the tree
     * @param maxDepth maximum depth to retain
     * @return trimmed tree
     */
    private ClusterNode trimTreeDepth(ClusterNode node, int maxDepth) {
        return trimRecursive(node, 0, maxDepth);
    }

    /**
     * Recursively trim a tree to a given depth.
     *
     * @param node     current node
     * @param depth    current depth
     * @param maxDepth maximum allowed depth
     * @return trimmed node
     */
    private ClusterNode trimRecursive(ClusterNode node, int depth, int maxDepth) {
        if (node == null || depth >= maxDepth) return null;

        ClusterNode trimmed = new ClusterNode(node.color, node.points, node.id);
        trimmed.left = trimRecursive(node.left, depth + 1, maxDepth);
        trimmed.right = trimRecursive(node.right, depth + 1, maxDepth);
        return trimmed;
    }

    /**
     * Flatten the tree to a list using breadth-first search (BFS).
     *
     * @param root root of the cluster tree
     * @return list of colors as integer RGB lists
     */
    public List<List<Integer>> bfsToFlatList(ClusterNode root) {
        List<List<Integer>> flatList = new ArrayList<>();
        if (root == null) {
            return flatList;
        }

        Queue<ClusterNode> queue = new LinkedList<>();
        Set<Integer> visitedIds = new HashSet<>();

        queue.offer(root);
        visitedIds.add(root.id);

        while (!queue.isEmpty()) {
            ClusterNode current = queue.poll();

            List<Integer> nodeRepresentation = new ArrayList<>();
            for (int c : current.color) {
                nodeRepresentation.add(c);
            }
            flatList.add(nodeRepresentation);

            if (current.left != null && !visitedIds.contains(current.left.id)) {
                queue.offer(current.left);
                visitedIds.add(current.left.id);
            }

            if (current.right != null && !visitedIds.contains(current.right.id)) {
                queue.offer(current.right);
                visitedIds.add(current.right.id);
            }
        }

        return flatList;
    }
}