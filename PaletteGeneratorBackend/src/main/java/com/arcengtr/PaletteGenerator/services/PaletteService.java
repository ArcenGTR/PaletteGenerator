package com.arcengtr.PaletteGenerator.services;

import com.arcengtr.PaletteGenerator.dtos.UserDTO;
import com.arcengtr.PaletteGenerator.dtos.palette.ImageHierarchicalPaletteRequestDTO;
import com.arcengtr.PaletteGenerator.dtos.palette.ImageKMeansPaletteRequestDTO;
import com.arcengtr.PaletteGenerator.dtos.palette.ImageSOMPaletteRequestDTO;
import com.arcengtr.PaletteGenerator.dtos.palette.PaletteDTO;
import com.arcengtr.PaletteGenerator.entities.Palette;
import com.arcengtr.PaletteGenerator.entities.User;
import com.arcengtr.PaletteGenerator.mappers.PaletteMapper;
import com.arcengtr.PaletteGenerator.mappers.UserMapper;
import com.arcengtr.PaletteGenerator.paletteGenerator.ClusterNode;
import com.arcengtr.PaletteGenerator.paletteGenerator.HierarchicalPaletteGenerator;
import com.arcengtr.PaletteGenerator.paletteGenerator.KMeansPaletteGenerator;
import com.arcengtr.PaletteGenerator.paletteGenerator.SOMPaletteGenerator;
import com.arcengtr.PaletteGenerator.repositories.PaletteRepository;
import com.arcengtr.PaletteGenerator.repositories.UserRepository;
import com.mongodb.client.result.UpdateResult;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaletteService {

    private final PaletteRepository paletteRepository;
    private final MongoTemplate mongoTemplate;
    private final PaletteMapper paletteMapper;
    private final UserService userService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    private BufferedImage decodeAndReadImage(String base64Image) throws IOException, IllegalArgumentException {
        byte[] imageBytes = Base64.getDecoder().decode(base64Image);
        try (ByteArrayInputStream bis = new ByteArrayInputStream(imageBytes)) {
            BufferedImage image = ImageIO.read(bis);
            if (image == null) {
                throw new IOException("Could not read image from provided Base64 string. Invalid format or corrupted data.");
            }
            return image;
        }
    }

    public List<List<Integer>> generateKMeansPalette(ImageKMeansPaletteRequestDTO request) throws IOException, IllegalArgumentException {
        BufferedImage image = decodeAndReadImage(request.getBase64Image());

        KMeansPaletteGenerator kMeansPaletteGenerator = new KMeansPaletteGenerator(20, request.isUseKMeansPP());
        return kMeansPaletteGenerator.generatePalette(image, request.getNumColors());
    }

    public List<List<List<Integer>>> generateSOMPalette(ImageSOMPaletteRequestDTO request) throws IOException, IllegalArgumentException {
        BufferedImage image = decodeAndReadImage(request.getBase64Image());

        SOMPaletteGenerator somPaletteGenerator = new SOMPaletteGenerator(request.getMapWidth(), request.getMapHeight());
        return somPaletteGenerator.generatePalette(image, request.getMapWidth() * request.getMapHeight());
    }

    public List<List<List<Integer>>> generateHierarchicalPaletteWithHistory(ImageHierarchicalPaletteRequestDTO request) throws IOException, IllegalArgumentException {
        BufferedImage image = decodeAndReadImage(request.getBase64Image());

        int historyDepth = switch (request.getHistoryDepth()) {
            case ("shallow") -> 4;
            case ("medium") -> 7;
            case ("deep") -> 11;
            default -> 4;
        };

        HierarchicalPaletteGenerator hierarchicalPaletteGenerator = new HierarchicalPaletteGenerator();
        List<ClusterNode> mappedPalette = hierarchicalPaletteGenerator.generatePalette(image, request.getNumColors());

        List<List<List<Integer>>> palette = new ArrayList<>();
        for (ClusterNode clusterNode : mappedPalette) {
            palette.add(hierarchicalPaletteGenerator.bfsToFlatList(hierarchicalPaletteGenerator.extractClusterHistorySubtree(clusterNode, historyDepth, 3)));
        }
        return palette;
    }

    @Transactional
    public Palette savePaletteToHistory(PaletteDTO paletteDTO) {
        UUID userId = userService.getCurrentUserId();

        paletteDTO.setPaletteId(UUID.randomUUID());
        paletteDTO.setUserId(userId);
        paletteDTO.setSaved(false);
        paletteDTO.setPublished(false);
        paletteDTO.setCreatedAt(new Date());

        Palette palette = paletteMapper.toEntity(paletteDTO);

        return paletteRepository.save(palette);
    }

    public List<PaletteDTO> loadUserPaletteHistory() {
        UUID userId = userService.getCurrentUserId();

        return paletteRepository.findAllByUserIdAndSavedIsFalseAndPublishedIsFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(paletteMapper::toDTO)
                .toList();
    }

    @Transactional
    public void savePalette(UUID paletteId) {
        paletteRepository.findById(paletteId).ifPresent(palette -> {
            palette.setSaved(true);
            paletteRepository.save(palette);
        });
    }

    @Transactional
    public void publishPalette(UUID paletteId) {
        paletteRepository.findById(paletteId).ifPresent(palette -> {
            palette.setPublished(true);
            palette.setSaved(true);
            paletteRepository.save(palette);
        });
    }

    @Transactional
    public void deleteUserPaletteHistory() {
        UUID userId = userService.getCurrentUserId();

        paletteRepository.deleteAllByUserIdAndSavedIsFalseAndPublishedIsFalse(userId);
    }

    public List<PaletteDTO> loadPublishedPalettes() {
        return paletteRepository.findAllByPublishedIsTrueOrderByVotesDesc().stream()
                .map(paletteMapper::toDTO)
                .toList();
    }

    public Page<PaletteDTO> loadPublishedPalettesPageable(Pageable pageable) {

        Page<Palette> palettePage = paletteRepository.findAllByPublishedIsTrueOrderByVotesDesc(pageable);

        return palettePage.map(paletteMapper::toDTO);
    }

    private boolean incrementVote(UUID paletteId) {
        Query query = new Query(Criteria.where("_id").is(paletteId));

        Update update = new Update().inc("votes", 1);

        UpdateResult updateResult = mongoTemplate.updateFirst(query, update, Palette.class);

        return updateResult.wasAcknowledged() && updateResult.getModifiedCount() > 0;
    }

    private boolean decrementVote(UUID paletteId) {
        Query query = new Query(Criteria.where("_id").is(paletteId));

        Update update = new Update().inc("votes", -1);

        UpdateResult updateResult = mongoTemplate.updateFirst(query, update, Palette.class);

        return updateResult.wasAcknowledged() && updateResult.getModifiedCount() > 0;
    }

    private boolean addVotedtoUser(UUID paletteId, UUID userId) {
        Query query = new Query(Criteria.where("_id").is(userId));

        Update update = new Update().addToSet("voted", paletteId);

        UpdateResult updateResult = mongoTemplate.updateFirst(query, update, User.class);

        return updateResult.wasAcknowledged() && updateResult.getModifiedCount() > 0;
    }

    private boolean deleteVotedfromUser(UUID paletteId, UUID userId) {
        Query query = new Query(Criteria.where("_id").is(userId));

        Update update = new Update().pull("voted", paletteId);

        UpdateResult updateResult = mongoTemplate.updateFirst(query, update, User.class);

        return updateResult.wasAcknowledged() && updateResult.getModifiedCount() > 0;
    }

    public boolean hasUserVoted(UUID userId, UUID paletteId) {
        Query query = new Query(Criteria.where("_id").is(userId).and("voted").is(paletteId));
        return mongoTemplate.exists(query, User.class);
    }

    @Transactional
    public PaletteDTO upvotePalette(UUID paletteId) {
        UUID userId = userService.getCurrentUserId();

        if (hasUserVoted(userId, paletteId)) {
            return null;
        }

        if (incrementVote(paletteId)) {
            addVotedtoUser(paletteId, userId);
            return getPaletteById(paletteId);
        } else {
            return null;
        }
    }

    @Transactional
    public PaletteDTO removeVote(UUID paletteId) {
        UUID userId = userService.getCurrentUserId();

        if (!hasUserVoted(userId, paletteId)) {
            return null;
        }

        if (decrementVote(paletteId)) {
            deleteVotedfromUser(paletteId, userId);
            return getPaletteById(paletteId);
        } else {
            return null;
        }
    }

    public PaletteDTO getPaletteById(UUID paletteId) {
        return paletteRepository.findById(paletteId).map(paletteMapper::toDTO).orElse(null);
    }

    public List<PaletteDTO> getUserVotedPalettes() {
        UUID userId = userService.getCurrentUserId();

        UserDTO userDTO = userMapper.toDto(userRepository.findByUserId(userId).orElse(null));

        return userDTO.getVoted().stream().map(paletteId ->
                paletteMapper.toDTO(paletteRepository.findById(paletteId).orElse(null))).toList();
    }

    public List<PaletteDTO> getUserSavedPalettes() {
        UUID userId = userService.getCurrentUserId();

        Criteria criteria = new Criteria().andOperator(
                Criteria.where("userId").is(userId),
                new Criteria().orOperator(
                        Criteria.where("published").is(true),
                        Criteria.where("saved").is(true)
                )
        );

        Query query = new Query(criteria);

        List<Palette> palettes = mongoTemplate.find(query, Palette.class);

        return palettes.stream().map(paletteMapper::toDTO).toList();
    }

    public Long deletePalette(UUID paletteId) {
        return paletteRepository.deletePaletteByPaletteId(paletteId);
    }
}