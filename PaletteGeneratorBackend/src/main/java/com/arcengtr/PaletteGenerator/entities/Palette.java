package com.arcengtr.PaletteGenerator.entities;


import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Document(collection = "palettes")
public class Palette {

    @Id
    @Field(targetType = FieldType.STRING)
    private UUID paletteId;

    // --------------------------

    @Field(targetType = FieldType.STRING)
    private UUID userId;

    // ---------------------------

    private Integer votes;

    private String method;

    private List<List<Double>> palette;

    private List<List<List<Double>>> kohonenMap;

    private List<List<List<Double>>> mergeHistory;

    private String imageUrl;

    @Builder.Default
    private Boolean saved = false;

    @Builder.Default
    private Boolean published = false;

    // ----------------------------

    private Date createdAt;

    @Version
    private Integer version;

    // -----------------------------

}
