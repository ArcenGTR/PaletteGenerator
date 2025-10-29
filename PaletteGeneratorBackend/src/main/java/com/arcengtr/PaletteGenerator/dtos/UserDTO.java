package com.arcengtr.PaletteGenerator.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private UUID userId;
    private List<UUID> palettes;
    private Set<UUID> voted;
    private String username;
    private String email;

}
