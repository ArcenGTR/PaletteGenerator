package com.arcengtr.PaletteGenerator.repositories;

import com.arcengtr.PaletteGenerator.entities.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends MongoRepository<User, UUID> {

    Optional<User> findByUserId(UUID userId);

    Optional<User> findByUsername(String username);

}
