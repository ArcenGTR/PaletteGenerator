package com.arcengtr.PaletteGenerator.entities;


import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    @Field(targetType = FieldType.STRING)
    private UUID userId;

    // --------------------------

    private List<UUID> palettes;

    private Set<UUID> voted;

    // --------------------------

    private String username;

    private String email;

    // --------------------------

    @Version
    private Integer version;
}
