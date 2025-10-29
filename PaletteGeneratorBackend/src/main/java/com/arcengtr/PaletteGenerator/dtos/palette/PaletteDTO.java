package com.arcengtr.PaletteGenerator.dtos.palette;

import lombok.Data;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Data
public class PaletteDTO {
    private UUID paletteId;
    private UUID userId;
    private Integer votes;
    private String method;
    private List<List<Double>> palette;
    private List<List<List<Double>>> kohonenMap;
    private List<List<List<Double>>> mergeHistory;
    private String imageUrl;
    private Boolean saved;
    private Boolean published;
    private Date createdAt;
}
