package com.arcengtr.PaletteGenerator.mappers;

import com.arcengtr.PaletteGenerator.dtos.palette.PaletteDTO;
import com.arcengtr.PaletteGenerator.entities.Palette;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public abstract class PaletteMapper {

    public abstract PaletteDTO toDTO(Palette palette);

    public abstract Palette toEntity(PaletteDTO paletteDTO);
}
