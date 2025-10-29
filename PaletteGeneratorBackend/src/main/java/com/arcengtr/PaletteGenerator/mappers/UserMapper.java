package com.arcengtr.PaletteGenerator.mappers;

import com.arcengtr.PaletteGenerator.dtos.UserDTO;
import com.arcengtr.PaletteGenerator.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDto(User user);

    @Mapping(target = "voted", expression = "java(java.util.Set.of())")
    User toEntity(UserDTO userDTO);
}
