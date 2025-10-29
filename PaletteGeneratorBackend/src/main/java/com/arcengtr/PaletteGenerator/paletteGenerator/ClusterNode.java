package com.arcengtr.PaletteGenerator.paletteGenerator;
import java.util.Arrays;
import java.util.List;

public class ClusterNode {
    public int[] color;
    public ClusterNode left;
    public ClusterNode right;
    public List<int[]> points;
    public int id;

    public ClusterNode(int[] color, List<int[]> points, int id) {
        this.color = color;
        this.points = points;
        this.id = id;
    }

    @Override
    public String toString() {
        return Arrays.toString(color);
    }
}