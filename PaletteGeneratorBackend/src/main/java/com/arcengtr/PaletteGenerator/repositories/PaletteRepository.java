package com.arcengtr.PaletteGenerator.repositories;

import com.arcengtr.PaletteGenerator.entities.Palette;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.UUID;

public interface PaletteRepository extends MongoRepository<Palette, UUID> {

    List<Palette> findAllByUserIdAndSavedIsFalseAndPublishedIsFalseOrderByCreatedAtDesc(UUID userId);

    void deleteAllByUserIdAndSavedIsFalseAndPublishedIsFalse(UUID userId);

    List<Palette> findAllByPublishedIsTrueOrderByVotesDesc();

    Page<Palette> findAllByPublishedIsTrueOrderByVotesDesc(Pageable pageable);


    Long deletePaletteByPaletteId(UUID paletteId);

}
